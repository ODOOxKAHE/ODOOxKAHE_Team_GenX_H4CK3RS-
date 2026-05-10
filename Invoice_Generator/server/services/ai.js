import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize Gemini
const gemini = new GoogleGenerativeAI( process.env.GEMINI_API_KEY );

// Initialize OpenAI with key rotation
const openaiKeys = ( process.env.OPENAI_API_KEYS || '' ).split( ',' ).filter( key => key.trim() );
let currentKeyIndex = 0;

function getOpenAIClient ()
{
    if ( openaiKeys.length === 0 ) return null;
    return new OpenAI( { apiKey: openaiKeys[ currentKeyIndex ] } );
}

function rotateOpenAIKey ()
{
    currentKeyIndex = ( currentKeyIndex + 1 ) % openaiKeys.length;
    console.log( `🔄 Rotating to OpenAI key ${ currentKeyIndex + 1 }/${ openaiKeys.length }` );
}

// Query document with AI - returns best response from multiple sources
export async function queryDocumentWithAI ( query, documentText, extractedData )
{
    const results = {
        pattern: null,
        gemini: null,
        openai: null,
        bestResponse: null,
        source: 'pattern'
    };

    const context = `
Document Text:
${ documentText }

Extracted Data:
- Invoice Number: ${ extractedData?.invoiceNumber || 'Not found' }
- Vendor: ${ extractedData?.vendor || 'Not found' }
- Date: ${ extractedData?.date || 'Not found' }
- Total: ${ extractedData?.total || 'Not found' }
- Items: ${ JSON.stringify( extractedData?.items || [] ) }
`;

    const prompt = `You are analyzing a document (likely an invoice or bill). Answer the following question based on the document content.

${ context }

Question: ${ query }

Provide a concise, helpful answer. If the information is not available in the document, say so clearly.`;

    // 1. Try pattern matching first (fast, offline)
    results.pattern = patternBasedQuery( query, documentText, extractedData );

    // 2. Try Gemini
    try
    {
        const model = gemini.getGenerativeModel( { model: 'gemini-pro' } );
        const result = await model.generateContent( prompt );
        const response = await result.response;
        results.gemini = response.text();
    } catch ( error )
    {
        console.error( 'Gemini Error:', error.message );
        results.gemini = null;
    }

    // 3. Try OpenAI with key rotation
    const maxRetries = Math.min( openaiKeys.length, 5 );
    for ( let i = 0; i < maxRetries; i++ )
    {
        try
        {
            const openai = getOpenAIClient();
            if ( !openai ) break;

            const completion = await openai.chat.completions.create( {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that analyzes documents and answers questions about them concisely.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 500
            } );
            results.openai = completion.choices[ 0 ]?.message?.content;
            break;
        } catch ( error )
        {
            console.error( `OpenAI Error (key ${ currentKeyIndex + 1 }):`, error.message );
            if ( error.status === 429 || error.status === 401 )
            {
                rotateOpenAIKey();
            } else
            {
                break;
            }
        }
    }

    // 4. Select best response
    results.bestResponse = selectBestResponse( results, query );

    return results;
}

// Pattern-based query (fast, offline fallback)
function patternBasedQuery ( query, text, data )
{
    const q = query.toLowerCase();

    if ( q.includes( 'total' ) || q.includes( 'amount' ) || q.includes( 'price' ) )
    {
        return data?.total ? `The total amount is ₹${ data.total }` : 'Total amount not found in document.';
    }
    if ( q.includes( 'vendor' ) || q.includes( 'company' ) || q.includes( 'from' ) || q.includes( 'seller' ) )
    {
        return data?.vendor ? `The vendor/company is: ${ data.vendor }` : 'Vendor information not found.';
    }
    if ( q.includes( 'invoice' ) || q.includes( 'number' ) || q.includes( 'bill number' ) )
    {
        return data?.invoiceNumber ? `The invoice number is: ${ data.invoiceNumber }` : 'Invoice number not found.';
    }
    if ( q.includes( 'date' ) || q.includes( 'when' ) )
    {
        return data?.date ? `The date is: ${ data.date }` : 'Date not found in document.';
    }
    if ( q.includes( 'item' ) || q.includes( 'product' ) || q.includes( 'list' ) )
    {
        if ( data?.items?.length > 0 )
        {
            return `Found ${ data.items.length } items:\n` +
                data.items.map( i => `• ${ i.description } (${ i.quantity } × ₹${ i.price })` ).join( '\n' );
        }
        return 'No itemized list found in document.';
    }

    return 'Unable to find specific information. Try asking about total, vendor, invoice number, date, or items.';
}

// Select the best response from available sources
function selectBestResponse ( results, query )
{
    // Prefer AI responses if they're more detailed
    const aiResponses = [ results.gemini, results.openai ].filter( r => r && r.length > 20 );

    if ( aiResponses.length > 0 )
    {
        // Pick the most detailed AI response
        const best = aiResponses.reduce( ( a, b ) => ( a.length > b.length ? a : b ) );
        results.source = results.gemini === best ? 'gemini' : 'openai';
        return best;
    }

    // Fall back to pattern matching
    results.source = 'pattern';
    return results.pattern;
}

// Generate smart invoice suggestions
export async function generateInvoiceSuggestions ( invoiceData )
{
    const prompt = `Based on this invoice data, provide 3 brief suggestions to improve it:
    
Invoice: ${ invoiceData.invoiceNumber }
Customer: ${ invoiceData.customerName || 'Not specified' }
Items: ${ invoiceData.items?.length || 0 }
Total: ₹${ invoiceData.total || 0 }

Keep suggestions to 1 line each.`;

    try
    {
        const model = gemini.getGenerativeModel( { model: 'gemini-pro' } );
        const result = await model.generateContent( prompt );
        return result.response.text();
    } catch ( error )
    {
        return null;
    }
}

export default {
    queryDocumentWithAI,
    generateInvoiceSuggestions
};
