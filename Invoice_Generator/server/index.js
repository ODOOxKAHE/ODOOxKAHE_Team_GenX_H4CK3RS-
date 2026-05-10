import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import Razorpay from 'razorpay';
import { queryDocumentWithAI, generateInvoiceSuggestions } from './services/ai.js';
import { getExchangeRates, convertCurrency, getCryptoPrices, fiatToCrypto, FIAT_CURRENCIES, CRYPTO_CURRENCIES, generateEthereumPaymentRequest, generateSolanaPaymentRequest } from './services/currency.js';
import { TEMPLATES, generateInvoiceHTML } from './services/templates.js';

dotenv.config();

const app = express();
app.use( cors() );
app.use( express.json() );

// Initialize Twilio
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Initialize SendGrid
sgMail.setApiKey( process.env.SENDGRID_API_KEY );

// Initialize Razorpay (or null if not configured)
const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id' &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret';

let razorpay = null;
if ( isRazorpayConfigured )
{
    razorpay = new Razorpay( {
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    } );
}

// Test mode flag
const TEST_MODE = !isRazorpayConfigured;

// ==================== TWILIO ENDPOINTS ====================

// Send SMS
app.post( '/api/notify/sms', async ( req, res ) =>
{
    try
    {
        const { to, message } = req.body;
        const phoneNumber = to || process.env.DEFAULT_NOTIFY_PHONE;

        const result = await twilioClient.messages.create( {
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        } );

        res.json( {
            success: true,
            messageId: result.sid,
            message: 'SMS sent successfully!'
        } );
    } catch ( error )
    {
        console.error( 'SMS Error:', error );
        res.status( 500 ).json( {
            success: false,
            error: error.message
        } );
    }
} );

// Make Voice Call
app.post( '/api/notify/call', async ( req, res ) =>
{
    try
    {
        const { to, message } = req.body;
        const phoneNumber = to || process.env.DEFAULT_NOTIFY_PHONE;

        // Create TwiML for the call
        const twimlMessage = `
      <Response>
        <Say voice="alice">${ message }</Say>
        <Pause length="1"/>
        <Say voice="alice">Thank you for using Invoice AI. Goodbye!</Say>
      </Response>
    `;

        const result = await twilioClient.calls.create( {
            twiml: twimlMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        } );

        res.json( {
            success: true,
            callId: result.sid,
            message: 'Call initiated successfully!'
        } );
    } catch ( error )
    {
        console.error( 'Call Error:', error );
        res.status( 500 ).json( {
            success: false,
            error: error.message
        } );
    }
} );

// Send WhatsApp Message (using Twilio Sandbox)
app.post( '/api/notify/whatsapp', async ( req, res ) =>
{
    try
    {
        const { to, message } = req.body;
        const phoneNumber = to || process.env.DEFAULT_NOTIFY_PHONE;

        // Use Twilio WhatsApp Sandbox number
        // Recipients must first send "join crop-path" to +1 415 523 8886
        const WHATSAPP_SANDBOX_NUMBER = '+14155238886';

        const result = await twilioClient.messages.create( {
            body: message,
            from: `whatsapp:${ WHATSAPP_SANDBOX_NUMBER }`,
            to: `whatsapp:${ phoneNumber.replace( /\s/g, '' ) }`
        } );

        res.json( {
            success: true,
            messageId: result.sid,
            message: 'WhatsApp message sent successfully!'
        } );
    } catch ( error )
    {
        console.error( 'WhatsApp Error:', error );

        // Provide helpful error message
        let errorMsg = error.message;
        if ( error.message.includes( 'not a valid WhatsApp' ) )
        {
            errorMsg = 'Recipient must first send "join crop-path" to +1 415 523 8886 to enable WhatsApp sandbox';
        }

        res.status( 500 ).json( {
            success: false,
            error: errorMsg
        } );
    }
} );

// ==================== SENDGRID ENDPOINT ====================

// Send Email with optional PDF attachment
app.post( '/api/notify/email', async ( req, res ) =>
{
    try
    {
        const { to, subject, text, html, invoiceData, pdfBase64 } = req.body;

        // Generate HTML email template
        const htmlContent = html || generateEmailTemplate( invoiceData );

        const msg = {
            to: to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: invoiceData?.companyName || 'InvoiceAI'
            },
            subject: subject || `Invoice ${ invoiceData?.invoiceNumber || '' } from ${ invoiceData?.companyName || 'InvoiceAI' }`,
            text: text || generatePlainTextEmail( invoiceData ),
            html: htmlContent
        };

        // Add PDF attachment if provided
        if ( pdfBase64 )
        {
            msg.attachments = [ {
                content: pdfBase64,
                filename: `Invoice-${ invoiceData?.invoiceNumber || 'document' }.pdf`,
                type: 'application/pdf',
                disposition: 'attachment'
            } ];
            console.log( '📎 PDF attachment added to email' );
        }

        console.log( 'Sending email with config:', {
            to: msg.to,
            from: msg.from,
            subject: msg.subject,
            hasAttachment: !!pdfBase64,
            apiKeyPrefix: process.env.SENDGRID_API_KEY?.substring( 0, 10 ) + '...'
        } );

        await sgMail.send( msg );

        res.json( {
            success: true,
            message: pdfBase64 ? 'Email with PDF sent successfully!' : 'Email sent successfully!'
        } );
    } catch ( error )
    {
        console.error( 'Email Error:', error );
        // Log detailed SendGrid error
        if ( error.response )
        {
            console.error( 'SendGrid Response Body:', JSON.stringify( error.response.body, null, 2 ) );
        }
        res.status( 500 ).json( {
            success: false,
            error: error.response?.body?.errors?.[ 0 ]?.message || error.message
        } );
    }
} );

// ==================== RAZORPAY ENDPOINTS ====================

// Create Payment Order
app.post( '/api/payment/create-order', async ( req, res ) =>
{
    try
    {
        const { amount, currency, invoiceNumber, customerName, customerEmail, customerPhone, dueDate, notes } = req.body;

        const options = {
            amount: Math.round( amount * 100 ), // Razorpay expects amount in paise
            currency: currency || 'INR',
            receipt: invoiceNumber || `rcpt_${ Date.now() }`,
            notes: {
                invoice_number: invoiceNumber,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                due_date: dueDate,
                ...notes
            }
        };

        const order = await razorpay.orders.create( options );

        res.json( {
            success: true,
            order: order,
            key_id: process.env.RAZORPAY_KEY_ID
        } );
    } catch ( error )
    {
        console.error( 'Razorpay Order Error:', error );
        res.status( 500 ).json( {
            success: false,
            error: error.message
        } );
    }
} );

// Verify Payment
app.post( '/api/payment/verify', async ( req, res ) =>
{
    try
    {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const crypto = await import( 'crypto' );
        const expectedSignature = crypto
            .createHmac( 'sha256', process.env.RAZORPAY_KEY_SECRET )
            .update( `${ razorpay_order_id }|${ razorpay_payment_id }` )
            .digest( 'hex' );

        const isValid = expectedSignature === razorpay_signature;

        if ( isValid )
        {
            // Payment is verified, you can save to database here
            res.json( {
                success: true,
                message: 'Payment verified successfully!',
                payment_id: razorpay_payment_id
            } );
        } else
        {
            res.status( 400 ).json( {
                success: false,
                error: 'Payment verification failed'
            } );
        }
    } catch ( error )
    {
        console.error( 'Payment Verification Error:', error );
        res.status( 500 ).json( {
            success: false,
            error: error.message
        } );
    }
} );

// Create Payment Link (for sharing)
app.post( '/api/payment/create-link', async ( req, res ) =>
{
    try
    {
        const {
            amount,
            invoiceNumber,
            customerName,
            customerEmail,
            customerPhone,
            dueDate,
            description,
            notifyPhone
        } = req.body;

        // TEST MODE: Generate demo payment link
        if ( TEST_MODE )
        {
            const demoLinkId = `demo_${ Date.now() }_${ Math.random().toString( 36 ).substr( 2, 9 ) }`;
            // Use local server URL that actually works
            const origin = req.headers.origin || 'http://localhost:5174';
            const demoPaymentLink = `${ origin }/pay.html?invoice=${ invoiceNumber }&amount=${ amount }&id=${ demoLinkId }`;

            console.log( '🧪 TEST MODE: Generated demo payment link:', demoPaymentLink );

            return res.json( {
                success: true,
                paymentLink: demoPaymentLink,
                linkId: demoLinkId,
                testMode: true,
                message: 'Demo payment link created (Razorpay not configured)'
            } );
        }

        // PRODUCTION MODE: Use Razorpay
        const paymentLink = await razorpay.paymentLink.create( {
            amount: Math.round( amount * 100 ),
            currency: 'INR',
            accept_partial: false,
            description: description || `Payment for Invoice ${ invoiceNumber }`,
            customer: {
                name: customerName,
                email: customerEmail,
                contact: customerPhone || notifyPhone || process.env.DEFAULT_NOTIFY_PHONE
            },
            notify: {
                sms: true,
                email: true
            },
            reminder_enable: true,
            notes: {
                invoice_number: invoiceNumber,
                due_date: dueDate
            },
            callback_url: `${ req.headers.origin || 'http://localhost:5173' }/payment-success`,
            callback_method: 'get',
            expire_by: dueDate ? Math.floor( new Date( dueDate ).getTime() / 1000 ) : undefined
        } );

        res.json( {
            success: true,
            paymentLink: paymentLink.short_url,
            linkId: paymentLink.id
        } );
    } catch ( error )
    {
        console.error( 'Payment Link Error:', error );
        res.status( 500 ).json( {
            success: false,
            error: error.message
        } );
    }
} );

// Send Payment Reminder
app.post( '/api/payment/send-reminder', async ( req, res ) =>
{
    try
    {
        const {
            invoiceNumber,
            customerName,
            customerPhone,
            customerEmail,
            amount,
            dueDate,
            paymentLink,
            reminderType // 'sms', 'email', 'call', 'all'
        } = req.body;

        const phone = customerPhone || process.env.DEFAULT_NOTIFY_PHONE;
        const formattedAmount = new Intl.NumberFormat( 'en-IN', {
            style: 'currency',
            currency: 'INR'
        } ).format( amount );

        const results = { sms: null, email: null, call: null };

        // SMS Reminder
        if ( reminderType === 'sms' || reminderType === 'all' )
        {
            try
            {
                const smsResult = await twilioClient.messages.create( {
                    body: `🧾 Payment Reminder\n\nInvoice: ${ invoiceNumber }\nAmount Due: ${ formattedAmount }\nDue Date: ${ dueDate }\n\nPay now: ${ paymentLink }\n\nThank you!\n- ${ customerName ? 'Dear ' + customerName : 'Customer' }`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phone
                } );
                results.sms = { success: true, sid: smsResult.sid };
            } catch ( e )
            {
                results.sms = { success: false, error: e.message };
            }
        }

        // Email Reminder
        if ( ( reminderType === 'email' || reminderType === 'all' ) && customerEmail )
        {
            try
            {
                await sgMail.send( {
                    to: customerEmail,
                    from: process.env.SENDGRID_FROM_EMAIL,
                    subject: `Payment Reminder: Invoice ${ invoiceNumber } - ${ formattedAmount } Due`,
                    html: generatePaymentReminderEmail( { invoiceNumber, customerName, amount: formattedAmount, dueDate, paymentLink } )
                } );
                results.email = { success: true };
            } catch ( e )
            {
                results.email = { success: false, error: e.message };
            }
        }

        // Voice Call Reminder
        if ( reminderType === 'call' || reminderType === 'all' )
        {
            try
            {
                const callResult = await twilioClient.calls.create( {
                    twiml: `<Response>
            <Say voice="alice">Hello ${ customerName || 'Customer' }. This is a payment reminder for invoice ${ invoiceNumber }. The amount due is ${ amount } rupees. The due date is ${ dueDate }. Please make the payment at your earliest convenience. Thank you for your business!</Say>
          </Response>`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phone
                } );
                results.call = { success: true, sid: callResult.sid };
            } catch ( e )
            {
                results.call = { success: false, error: e.message };
            }
        }

        res.json( {
            success: true,
            results
        } );
    } catch ( error )
    {
        console.error( 'Reminder Error:', error );
        res.status( 500 ).json( {
            success: false,
            error: error.message
        } );
    }
} );

// ==================== CALENDAR ENDPOINTS ====================

// Generate iCal file
app.get( '/api/calendar/ical', ( req, res ) =>
{
    const { title, description, startDate, endDate, location } = req.query;

    const start = new Date( startDate || Date.now() );
    const end = new Date( endDate || Date.now() + 3600000 );

    const formatDate = ( date ) =>
    {
        return date.toISOString().replace( /[-:]/g, '' ).split( '.' )[ 0 ] + 'Z';
    };

    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InvoiceAI//Invoice Reminder//EN
BEGIN:VEVENT
UID:${ Date.now() }@invoiceai.local
DTSTAMP:${ formatDate( new Date() ) }
DTSTART:${ formatDate( start ) }
DTEND:${ formatDate( end ) }
SUMMARY:${ title || 'Invoice Reminder' }
DESCRIPTION:${ description || 'Payment due reminder' }
LOCATION:${ location || '' }
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    res.setHeader( 'Content-Type', 'text/calendar' );
    res.setHeader( 'Content-Disposition', `attachment; filename="invoice-reminder.ics"` );
    res.send( icalContent );
} );

// Generate Google Calendar URL
app.get( '/api/calendar/google', ( req, res ) =>
{
    const { title, description, startDate, endDate, location } = req.query;

    const start = new Date( startDate || Date.now() );
    const end = new Date( endDate || Date.now() + 3600000 );

    const formatDate = ( date ) =>
    {
        return date.toISOString().replace( /[-:]/g, '' ).split( '.' )[ 0 ] + 'Z';
    };

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${ encodeURIComponent( title || 'Invoice Reminder' ) }&dates=${ formatDate( start ) }/${ formatDate( end ) }&details=${ encodeURIComponent( description || '' ) }&location=${ encodeURIComponent( location || '' ) }`;

    res.json( { url: googleUrl } );
} );

// Generate Outlook Calendar URL
app.get( '/api/calendar/outlook', ( req, res ) =>
{
    const { title, description, startDate, endDate, location } = req.query;

    const start = new Date( startDate || Date.now() );
    const end = new Date( endDate || Date.now() + 3600000 );

    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${ encodeURIComponent( title || 'Invoice Reminder' ) }&startdt=${ start.toISOString() }&enddt=${ end.toISOString() }&body=${ encodeURIComponent( description || '' ) }&location=${ encodeURIComponent( location || '' ) }`;

    res.json( { url: outlookUrl } );
} );

// ==================== AI ENDPOINTS ====================

// Query document with AI
app.post( '/api/ai/query', async ( req, res ) =>
{
    try
    {
        const { query, documentText, extractedData } = req.body;

        if ( !query )
        {
            return res.status( 400 ).json( { success: false, error: 'Query is required' } );
        }

        const result = await queryDocumentWithAI( query, documentText, extractedData );

        res.json( {
            success: true,
            answer: result.bestResponse,
            source: result.source,
            allResponses: {
                pattern: result.pattern,
                gemini: result.gemini,
                openai: result.openai
            }
        } );
    } catch ( error )
    {
        console.error( 'AI Query Error:', error );
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// Get invoice suggestions
app.post( '/api/ai/suggestions', async ( req, res ) =>
{
    try
    {
        const { invoiceData } = req.body;
        const suggestions = await generateInvoiceSuggestions( invoiceData );
        res.json( { success: true, suggestions } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// ==================== CURRENCY ENDPOINTS ====================

// Get exchange rates
app.get( '/api/currency/rates', async ( req, res ) =>
{
    try
    {
        const { base = 'USD' } = req.query;
        const rates = await getExchangeRates( base );
        res.json( { success: true, ...rates } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// Convert currency
app.get( '/api/currency/convert', async ( req, res ) =>
{
    try
    {
        const { amount, from, to } = req.query;
        const result = await convertCurrency( parseFloat( amount ), from, to );
        res.json( { success: true, ...result } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// Get supported currencies
app.get( '/api/currency/supported', ( req, res ) =>
{
    res.json( {
        success: true,
        fiat: FIAT_CURRENCIES,
        crypto: CRYPTO_CURRENCIES
    } );
} );

// Get crypto prices
app.get( '/api/crypto/prices', async ( req, res ) =>
{
    try
    {
        const prices = await getCryptoPrices();
        res.json( { success: true, prices } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// Convert fiat to crypto
app.get( '/api/crypto/convert', async ( req, res ) =>
{
    try
    {
        const { amount, fiat = 'INR', crypto } = req.query;
        const result = await fiatToCrypto( parseFloat( amount ), fiat, crypto );
        res.json( { success: true, ...result } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// Generate Ethereum payment request
app.post( '/api/crypto/eth-payment', ( req, res ) =>
{
    const { address, amountInEth, invoiceNumber } = req.body;
    if ( !address || !amountInEth )
    {
        return res.status( 400 ).json( { success: false, error: 'Address and amount required' } );
    }
    const payment = generateEthereumPaymentRequest( address, amountInEth, invoiceNumber );
    res.json( { success: true, payment } );
} );

// Generate Solana payment request
app.post( '/api/crypto/sol-payment', ( req, res ) =>
{
    const { address, amountInSol, invoiceNumber } = req.body;
    if ( !address || !amountInSol )
    {
        return res.status( 400 ).json( { success: false, error: 'Address and amount required' } );
    }
    const payment = generateSolanaPaymentRequest( address, amountInSol, invoiceNumber );
    res.json( { success: true, payment } );
} );

// ==================== TEMPLATE ENDPOINTS ====================

// Get all templates
app.get( '/api/templates', ( req, res ) =>
{
    res.json( { success: true, templates: TEMPLATES } );
} );

// Generate invoice HTML with template
app.post( '/api/templates/generate', ( req, res ) =>
{
    try
    {
        const { invoiceData, templateId } = req.body;
        const html = generateInvoiceHTML( invoiceData, templateId );
        res.json( { success: true, html } );
    } catch ( error )
    {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// ==================== SARVAM AI ENDPOINTS (Multilingual) ====================

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

// Supported Indian languages for TTS (10 languages + English)
const SUPPORTED_LANGUAGES = {
    'en-IN': { name: 'English (Indian)', code: 'en-IN' },
    'hi-IN': { name: 'Hindi', code: 'hi-IN' },
    'bn-IN': { name: 'Bengali', code: 'bn-IN' },
    'te-IN': { name: 'Telugu', code: 'te-IN' },
    'mr-IN': { name: 'Marathi', code: 'mr-IN' },
    'ta-IN': { name: 'Tamil', code: 'ta-IN' },
    'gu-IN': { name: 'Gujarati', code: 'gu-IN' },
    'kn-IN': { name: 'Kannada', code: 'kn-IN' },
    'ml-IN': { name: 'Malayalam', code: 'ml-IN' },
    'pa-IN': { name: 'Punjabi', code: 'pa-IN' },
    'od-IN': { name: 'Odia', code: 'od-IN' }
};

// Available speakers for TTS
const SPEAKERS = {
    female: ['Anushka', 'Manisha', 'Vidya', 'Arya'],
    male: ['Abhilash', 'Karun', 'Hitesh']
};

// Text-to-Speech using Sarvam AI
app.post( '/api/sarvam/tts', async ( req, res ) =>
{
    try
    {
        const { text, language = 'en-IN', speaker = 'Anushka' } = req.body;

        if ( !text )
        {
            return res.status( 400 ).json( { success: false, error: 'Text is required' } );
        }

        // Validate language code
        const langCode = SUPPORTED_LANGUAGES[language] ? language : 'en-IN';

        console.log( `🔊 TTS Request: Language=${langCode}, Speaker=${speaker}, Text length=${text.length}` );

        const response = await fetch( 'https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': SARVAM_API_KEY
            },
            body: JSON.stringify( {
                inputs: [ text.substring( 0, 1500 ) ], // Max 1500 chars per request
                target_language_code: langCode,
                speaker: speaker,
                pitch: 0,
                pace: 1.0,
                loudness: 1.5,
                speech_sample_rate: 22050,
                enable_preprocessing: true,
                model: 'bulbul:v2'
            } )
        } );

        if ( !response.ok )
        {
            const error = await response.text();
            console.error( 'Sarvam TTS API Error:', error );
            throw new Error( `Sarvam API error: ${ error }` );
        }

        const result = await response.json();
        console.log( '✅ TTS Success: Audio generated' );
        
        res.json( {
            success: true,
            audio: result.audios?.[ 0 ], // Base64 audio WAV
            format: 'wav'
        } );
    } catch ( error )
    {
        console.error( 'Sarvam TTS Error:', error );
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// Translate text using Sarvam AI
app.post( '/api/sarvam/translate', async ( req, res ) =>
{
    try
    {
        const { text, sourceLanguage = 'en-IN', targetLanguage = 'hi-IN' } = req.body;

        if ( !text )
        {
            return res.status( 400 ).json( { success: false, error: 'Text is required' } );
        }

        console.log( `🌐 Translate Request: ${sourceLanguage} -> ${targetLanguage}, Text length=${text.length}` );

        const response = await fetch( 'https://api.sarvam.ai/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': SARVAM_API_KEY
            },
            body: JSON.stringify( {
                input: text,
                source_language_code: sourceLanguage,
                target_language_code: targetLanguage,
                speaker_gender: 'Female',
                mode: 'formal',
                model: 'mayura:v1',
                enable_preprocessing: true
            } )
        } );

        if ( !response.ok )
        {
            const error = await response.text();
            console.error( 'Sarvam Translate API Error:', error );
            throw new Error( `Sarvam API error: ${ error }` );
        }

        const result = await response.json();
        console.log( '✅ Translation Success' );
        
        res.json( {
            success: true,
            translated_text: result.translated_text
        } );
    } catch ( error )
    {
        console.error( 'Sarvam Translation Error:', error );
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// Translate and speak (combined endpoint for convenience)
app.post( '/api/sarvam/translate-and-speak', async ( req, res ) =>
{
    try
    {
        const { text, targetLanguage = 'hi-IN', speaker = 'Anushka' } = req.body;

        if ( !text )
        {
            return res.status( 400 ).json( { success: false, error: 'Text is required' } );
        }

        console.log( `🎤 Translate & Speak: Target=${targetLanguage}, Speaker=${speaker}` );

        let textToSpeak = text;

        // If target language is not English, translate first
        if ( targetLanguage !== 'en-IN' )
        {
            const translateResponse = await fetch( 'https://api.sarvam.ai/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': SARVAM_API_KEY
                },
                body: JSON.stringify( {
                    input: text,
                    source_language_code: 'en-IN',
                    target_language_code: targetLanguage,
                    speaker_gender: 'Female',
                    mode: 'formal',
                    model: 'mayura:v1',
                    enable_preprocessing: true
                } )
            } );

            if ( translateResponse.ok )
            {
                const translateResult = await translateResponse.json();
                textToSpeak = translateResult.translated_text || text;
                console.log( '✅ Translation done:', textToSpeak.substring( 0, 100 ) + '...' );
            }
        }

        // Now convert to speech
        const ttsResponse = await fetch( 'https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': SARVAM_API_KEY
            },
            body: JSON.stringify( {
                inputs: [ textToSpeak.substring( 0, 1500 ) ],
                target_language_code: targetLanguage,
                speaker: speaker,
                pitch: 0,
                pace: 1.0,
                loudness: 1.5,
                speech_sample_rate: 22050,
                enable_preprocessing: true,
                model: 'bulbul:v2'
            } )
        } );

        if ( !ttsResponse.ok )
        {
            const error = await ttsResponse.text();
            throw new Error( `TTS API error: ${ error }` );
        }

        const ttsResult = await ttsResponse.json();
        console.log( '✅ TTS Success: Audio generated' );

        res.json( {
            success: true,
            translated_text: textToSpeak,
            audio: ttsResult.audios?.[ 0 ],
            format: 'wav'
        } );
    } catch ( error )
    {
        console.error( 'Translate & Speak Error:', error );
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// Get supported languages and speakers
app.get( '/api/sarvam/languages', ( req, res ) =>
{
    res.json( { 
        success: true, 
        languages: SUPPORTED_LANGUAGES,
        speakers: SPEAKERS
    } );
} );

// ==================== INVOICE HISTORY (in-memory for demo) ====================

const invoiceHistory = new Map();

// Save invoice
app.post( '/api/history/save', ( req, res ) =>
{
    const { invoice } = req.body;
    const id = invoice.invoiceNumber || `INV-${ Date.now() }`;
    invoiceHistory.set( id, { ...invoice, savedAt: new Date().toISOString() } );
    res.json( { success: true, id, message: 'Invoice saved' } );
} );

// Get invoice history
app.get( '/api/history', ( req, res ) =>
{
    const invoices = Array.from( invoiceHistory.values() )
        .sort( ( a, b ) => new Date( b.savedAt ) - new Date( a.savedAt ) );
    res.json( { success: true, invoices } );
} );

// Get single invoice
app.get( '/api/history/:id', ( req, res ) =>
{
    const invoice = invoiceHistory.get( req.params.id );
    if ( invoice )
    {
        res.json( { success: true, invoice } );
    } else
    {
        res.status( 404 ).json( { success: false, error: 'Invoice not found' } );
    }
} );

// Delete invoice
app.delete( '/api/history/:id', ( req, res ) =>
{
    const deleted = invoiceHistory.delete( req.params.id );
    res.json( { success: deleted, message: deleted ? 'Deleted' : 'Not found' } );
} );

// ==================== HELPER FUNCTIONS ====================

function generateEmailTemplate ( invoiceData )
{
    if ( !invoiceData ) return '<p>Invoice details not provided</p>';

    const items = invoiceData.items || [];
    const itemsHtml = items.map( item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${ item.description }</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${ item.quantity }</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${ item.price }</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${ item.quantity * item.price }</td>
    </tr>
  `).join( '' );

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">INVOICE</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">#${ invoiceData.invoiceNumber }</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="margin-bottom: 30px;">
          <h3 style="color: #667eea; margin: 0 0 10px;">From</h3>
          <p style="margin: 0;"><strong>${ invoiceData.companyName }</strong></p>
          <p style="margin: 5px 0; color: #666;">${ invoiceData.companyEmail }</p>
          <p style="margin: 5px 0; color: #666;">${ invoiceData.companyPhone }</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #667eea; margin: 0 0 10px;">Bill To</h3>
          <p style="margin: 0;"><strong>${ invoiceData.customerName || 'Customer' }</strong></p>
          <p style="margin: 5px 0; color: #666;">${ invoiceData.customerEmail || '' }</p>
          <p style="margin: 5px 0; color: #666;">${ invoiceData.customerPhone || '' }</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <p style="margin: 0;"><strong>Invoice Date:</strong> ${ invoiceData.invoiceDate }</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${ invoiceData.dueDate }</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <th style="padding: 12px; color: white; text-align: left;">Item</th>
              <th style="padding: 12px; color: white; text-align: center;">Qty</th>
              <th style="padding: 12px; color: white; text-align: right;">Price</th>
              <th style="padding: 12px; color: white; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${ itemsHtml }
          </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <p style="margin: 5px 0; color: #666;">Subtotal: ₹${ invoiceData.subtotal || 0 }</p>
          <p style="margin: 5px 0; color: #666;">Tax (${ invoiceData.taxRate || 0 }%): ₹${ invoiceData.tax || 0 }</p>
          <p style="margin: 10px 0; font-size: 24px; color: #667eea;"><strong>Total: ₹${ invoiceData.total || 0 }</strong></p>
        </div>
        
        ${ invoiceData.paymentLink ? `
          <div style="margin-top: 30px; text-align: center;">
            <a href="${ invoiceData.paymentLink }" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Pay Now</a>
          </div>
        ` : '' }
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
          <p style="color: #999; font-size: 14px;">${ invoiceData.notes || 'Thank you for your business!' }</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePlainTextEmail ( invoiceData )
{
    if ( !invoiceData ) return 'Invoice details not provided';

    const items = ( invoiceData.items || [] ).map( item =>
        `- ${ item.description }: ${ item.quantity } x ₹${ item.price } = ₹${ item.quantity * item.price }`
    ).join( '\n' );

    return `
INVOICE #${ invoiceData.invoiceNumber }

From: ${ invoiceData.companyName }
Email: ${ invoiceData.companyEmail }
Phone: ${ invoiceData.companyPhone }

Bill To: ${ invoiceData.customerName || 'Customer' }
Email: ${ invoiceData.customerEmail || 'N/A' }

Invoice Date: ${ invoiceData.invoiceDate }
Due Date: ${ invoiceData.dueDate }

Items:
${ items }

Subtotal: ₹${ invoiceData.subtotal || 0 }
Tax (${ invoiceData.taxRate || 0 }%): ₹${ invoiceData.tax || 0 }
Total: ₹${ invoiceData.total || 0 }

${ invoiceData.paymentLink ? `Pay Now: ${ invoiceData.paymentLink }` : '' }

${ invoiceData.notes || 'Thank you for your business!' }
  `.trim();
}

function generatePaymentReminderEmail ( { invoiceNumber, customerName, amount, dueDate, paymentLink } )
{
    return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">⏰ Payment Reminder</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Dear ${ customerName || 'Customer' },</p>
        
        <p>This is a friendly reminder that payment for the following invoice is due:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5af19;">
          <p style="margin: 5px 0;"><strong>Invoice:</strong> ${ invoiceNumber }</p>
          <p style="margin: 5px 0;"><strong>Amount Due:</strong> ${ amount }</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${ dueDate }</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${ paymentLink }" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">Pay Now</a>
        </div>
        
        <p>If you have already made the payment, please disregard this reminder.</p>
        
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;
}

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3001;
app.listen( PORT, () =>
{
    console.log( `🚀 InvoiceAI Server running on port ${ PORT }` );
    console.log( `📧 SendGrid: ${ process.env.SENDGRID_FROM_EMAIL }` );
    console.log( `📱 Twilio: ${ process.env.TWILIO_PHONE_NUMBER }` );
    console.log( `💳 Razorpay: ${ isRazorpayConfigured ? 'Configured' : '🧪 TEST MODE (demo links)' }` );
    if ( TEST_MODE )
    {
        console.log( `\n⚠️  Payment links will be DEMO links until Razorpay is configured` );
    }
} );
