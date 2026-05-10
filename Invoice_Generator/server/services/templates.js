// Invoice templates for different styles

export const TEMPLATES = {
    modern: {
        id: 'modern',
        name: 'Modern',
        description: 'Clean, contemporary design with gradient accents',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        fontFamily: 'Inter, sans-serif',
        style: 'gradient'
    },
    classic: {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional professional invoice layout',
        primaryColor: '#2c3e50',
        secondaryColor: '#34495e',
        fontFamily: 'Georgia, serif',
        style: 'solid'
    },
    minimal: {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple, clean design with lots of whitespace',
        primaryColor: '#000000',
        secondaryColor: '#666666',
        fontFamily: 'Helvetica, sans-serif',
        style: 'minimal'
    },
    bold: {
        id: 'bold',
        name: 'Bold',
        description: 'Eye-catching design with strong colors',
        primaryColor: '#e74c3c',
        secondaryColor: '#c0392b',
        fontFamily: 'Montserrat, sans-serif',
        style: 'bold'
    },
    corporate: {
        id: 'corporate',
        name: 'Corporate',
        description: 'Professional business-oriented design',
        primaryColor: '#0066cc',
        secondaryColor: '#004499',
        fontFamily: 'Arial, sans-serif',
        style: 'corporate'
    },
    creative: {
        id: 'creative',
        name: 'Creative',
        description: 'Unique design for creative industries',
        primaryColor: '#9b59b6',
        secondaryColor: '#8e44ad',
        fontFamily: 'Poppins, sans-serif',
        style: 'creative'
    }
};

// Generate HTML template for invoice
export function generateInvoiceHTML ( invoiceData, templateId = 'modern' )
{
    const template = TEMPLATES[ templateId ] || TEMPLATES.modern;
    const { primaryColor, secondaryColor, fontFamily, style } = template;

    const items = invoiceData.items || [];
    const itemsHTML = items.map( item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${ item.description }</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${ item.quantity }</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${ invoiceData.currencySymbol || '₹' }${ item.price.toFixed( 2 ) }</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${ invoiceData.currencySymbol || '₹' }${ ( item.quantity * item.price ).toFixed( 2 ) }</td>
        </tr>
    `).join( '' );

    const headerStyle = style === 'gradient'
        ? `background: linear-gradient(135deg, ${ primaryColor } 0%, ${ secondaryColor } 100%);`
        : style === 'minimal'
            ? `background: white; border-bottom: 3px solid ${ primaryColor };`
            : `background: ${ primaryColor };`;

    const titleColor = style === 'minimal' ? primaryColor : 'white';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Georgia&family=Montserrat:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${ fontFamily }; line-height: 1.6; color: #333; }
        
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body style="padding: 40px; max-width: 800px; margin: 0 auto;">
    <div style="${ headerStyle } padding: 30px; text-align: center; border-radius: ${ style === 'minimal' ? '0' : '10px 10px 0 0' };">
        <h1 style="color: ${ titleColor }; font-size: 36px; margin: 0;">${ style === 'minimal' ? 'INVOICE' : 'INVOICE' }</h1>
        <p style="color: ${ style === 'minimal' ? secondaryColor : 'rgba(255,255,255,0.9)' }; margin: 10px 0 0;">#${ invoiceData.invoiceNumber }</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
                <h3 style="color: ${ primaryColor }; margin: 0 0 10px;">From</h3>
                <strong>${ invoiceData.companyName }</strong><br>
                <span style="color: #666;">${ invoiceData.companyEmail }</span><br>
                <span style="color: #666;">${ invoiceData.companyPhone }</span>
            </div>
            <div style="text-align: right;">
                <h3 style="color: ${ primaryColor }; margin: 0 0 10px;">Bill To</h3>
                <strong>${ invoiceData.customerName || 'Customer' }</strong><br>
                <span style="color: #666;">${ invoiceData.customerEmail || '' }</span><br>
                <span style="color: #666;">${ invoiceData.customerPhone || '' }</span>
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <p><strong>Invoice Date:</strong> ${ invoiceData.invoiceDate }</p>
            <p><strong>Due Date:</strong> ${ invoiceData.dueDate }</p>
            <p><strong>Currency:</strong> ${ invoiceData.currency || 'INR' }</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
            <thead>
                <tr style="${ headerStyle }">
                    <th style="padding: 12px; color: ${ titleColor }; text-align: left;">Item</th>
                    <th style="padding: 12px; color: ${ titleColor }; text-align: center;">Qty</th>
                    <th style="padding: 12px; color: ${ titleColor }; text-align: right;">Price</th>
                    <th style="padding: 12px; color: ${ titleColor }; text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${ itemsHTML }
            </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
            <p style="color: #666;">Subtotal: ${ invoiceData.currencySymbol || '₹' }${ ( invoiceData.subtotal || 0 ).toFixed( 2 ) }</p>
            <p style="color: #666;">Tax (${ invoiceData.taxRate || 0 }%): ${ invoiceData.currencySymbol || '₹' }${ ( invoiceData.tax || 0 ).toFixed( 2 ) }</p>
            <p style="font-size: 24px; color: ${ primaryColor }; margin-top: 10px;"><strong>Total: ${ invoiceData.currencySymbol || '₹' }${ ( invoiceData.total || 0 ).toFixed( 2 ) }</strong></p>
        </div>
        
        ${ invoiceData.cryptoPayment ? `
        <div style="margin-top: 30px; padding: 20px; background: #1a1a2e; border-radius: 8px; color: white;">
            <h4 style="margin: 0 0 15px;">Crypto Payment</h4>
            <p>Network: ${ invoiceData.cryptoPayment.network }</p>
            <p>Amount: ${ invoiceData.cryptoPayment.amount.toFixed( 8 ) } ${ invoiceData.cryptoPayment.currency }</p>
            <p style="word-break: break-all; font-size: 12px; margin-top: 10px;">Address: ${ invoiceData.cryptoPayment.address }</p>
        </div>
        ` : '' }
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
            <p style="color: ${ primaryColor }; font-weight: 600;">Thank you for your business!</p>
            <p style="color: #999; font-size: 14px;">${ invoiceData.notes || '' }</p>
        </div>
    </div>
</body>
</html>
    `;
}

export default {
    TEMPLATES,
    generateInvoiceHTML
};
