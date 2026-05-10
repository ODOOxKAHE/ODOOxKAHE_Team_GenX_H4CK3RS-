import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';

const ShareModal = ( { data, total, onClose, showToast } ) =>
{
    const [ email, setEmail ] = useState( '' );
    const [ shareLink, setShareLink ] = useState( '' );
    const [ isGeneratingPdf, setIsGeneratingPdf ] = useState( false );
    const modalRef = useRef( null );

    const formatCurrency = ( amount ) =>
    {
        return new Intl.NumberFormat( 'en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        } ).format( amount );
    };

    const generateShareableLink = () =>
    {
        // Encode invoice data in URL
        const encodedData = btoa( JSON.stringify( {
            inv: data.invoiceNumber,
            cust: data.customerName,
            total: total,
            date: data.invoiceDate
        } ) );
        const link = `${ window.location.origin }?invoice=${ encodedData }`;
        setShareLink( link );
        return link;
    };

    const copyLink = async () =>
    {
        const link = shareLink || generateShareableLink();
        try
        {
            await navigator.clipboard.writeText( link );
            showToast( 'Link copied to clipboard!', 'success' );
        } catch ( err )
        {
            // Fallback for older browsers
            const textarea = document.createElement( 'textarea' );
            textarea.value = link;
            document.body.appendChild( textarea );
            textarea.select();
            document.execCommand( 'copy' );
            document.body.removeChild( textarea );
            showToast( 'Link copied to clipboard!', 'success' );
        }
    };

    const shareViaEmail = async () =>
    {
        // First generate PDF
        const invoiceElement = document.querySelector( '.invoice-preview' );
        if ( invoiceElement )
        {
            setIsGeneratingPdf( true );
            showToast( 'Generating PDF for attachment...', 'info' );

            try
            {
                const opt = {
                    margin: 0,
                    filename: `Invoice-${ data.invoiceNumber }.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                // Download the PDF first
                await html2pdf().set( opt ).from( invoiceElement ).save();
                showToast( 'PDF downloaded! Attach it to your email.', 'success' );
            } catch ( error )
            {
                console.error( 'PDF generation error:', error );
            }
            setIsGeneratingPdf( false );
        }

        // Open email client
        const subject = `Invoice ${ data.invoiceNumber } from ${ data.companyName }`;
        const body = `Dear ${ data.customerName || 'Customer' },

Please find attached your invoice.

Invoice Number: ${ data.invoiceNumber }
Invoice Date: ${ data.invoiceDate }
Due Date: ${ data.dueDate }
Total Amount: ${ formatCurrency( total ) }

${ data.notes || 'Thank you for your business!' }

Best regards,
${ data.companyName }
${ data.companyEmail }
${ data.companyPhone }`;

        const mailtoLink = `mailto:${ email || data.customerEmail || '' }?subject=${ encodeURIComponent( subject ) }&body=${ encodeURIComponent( body ) }`;
        window.open( mailtoLink );
        showToast( 'Attach the downloaded PDF to your email!', 'info' );
    };

    // Send email with PDF attachment via backend API
    const sendEmailWithPdf = async () => {
        const recipientEmail = email || data.customerEmail;
        if (!recipientEmail) {
            showToast('Please enter an email address', 'error');
            return;
        }

        const invoiceElement = document.querySelector('.invoice-preview');
        if (!invoiceElement) {
            showToast('Invoice preview not found', 'error');
            return;
        }

        setIsGeneratingPdf(true);
        showToast('Generating and sending invoice...', 'info');

        try {
            // Generate PDF as base64
            const opt = {
                margin: 0,
                filename: `Invoice-${data.invoiceNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const pdfBlob = await html2pdf().set(opt).from(invoiceElement).outputPdf('blob');
            
            // Convert blob to base64
            const reader = new FileReader();
            const pdfBase64 = await new Promise((resolve, reject) => {
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(pdfBlob);
            });

            // Send via backend API
            const response = await fetch('http://localhost:3001/api/notify/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: recipientEmail,
                    invoiceData: data,
                    pdfBase64: pdfBase64
                })
            });

            const result = await response.json();
            
            if (result.success) {
                showToast(`✅ Invoice sent to ${recipientEmail} with PDF attached!`, 'success');
            } else {
                showToast(`Failed: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Send email error:', error);
            showToast('Failed to send email. Check console for details.', 'error');
        }

        setIsGeneratingPdf(false);
    };

    const shareViaWhatsApp = () =>
    {
        const message = `🧾 *Invoice ${ data.invoiceNumber }*

From: ${ data.companyName }
To: ${ data.customerName || 'Customer' }
Date: ${ data.invoiceDate }

💰 *Total Amount: ${ formatCurrency( total ) }*

${ data.notes || 'Thank you for your business!' }

📧 ${ data.companyEmail }
📞 ${ data.companyPhone }`;

        const whatsappUrl = `https://wa.me/?text=${ encodeURIComponent( message ) }`;
        window.open( whatsappUrl, '_blank' );
        showToast( 'Opening WhatsApp...', 'success' );
    };

    const downloadPdf = async () =>
    {
        const invoiceElement = document.querySelector( '.invoice-preview' );
        if ( !invoiceElement )
        {
            showToast( 'Invoice preview not found. Please go back and try again.', 'error' );
            return;
        }

        setIsGeneratingPdf( true );
        showToast( 'Generating PDF...', 'info' );

        try
        {
            const opt = {
                margin: 0,
                filename: `Invoice-${ data.invoiceNumber }.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set( opt ).from( invoiceElement ).save();
            showToast( 'PDF downloaded successfully!', 'success' );
        } catch ( error )
        {
            console.error( 'PDF generation error:', error );
            showToast( 'Failed to generate PDF', 'error' );
        }
        setIsGeneratingPdf( false );
    };

    const handleBackdropClick = ( e ) =>
    {
        if ( e.target === modalRef.current )
        {
            onClose();
        }
    };

    return (
        <div
            className="modal-backdrop"
            ref={ modalRef }
            onClick={ handleBackdropClick }
            style={ {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(10, 10, 15, 0.9)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '24px'
            } }
        >
            <div
                className="modal-content glass-card"
                style={ {
                    maxWidth: '500px',
                    width: '100%',
                    animation: 'slideIn 0.3s ease'
                } }
            >
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title-icon">📤</span>
                        Share Invoice
                    </h2>
                    <button
                        onClick={ onClose }
                        style={ {
                            background: 'var(--bg-tertiary)',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '18px'
                        } }
                    >
                        ✕
                    </button>
                </div>

                {/* Invoice Summary */ }
                <div style={ {
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    marginBottom: '24px'
                } }>
                    <div style={ {
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                    } }>
                        <span style={ { color: 'var(--text-secondary)' } }>Invoice</span>
                        <span style={ { fontWeight: '600' } }>{ data.invoiceNumber }</span>
                    </div>
                    <div style={ {
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                    } }>
                        <span style={ { color: 'var(--text-secondary)' } }>Customer</span>
                        <span>{ data.customerName || 'Not specified' }</span>
                    </div>
                    <div style={ {
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    } }>
                        <span style={ { color: 'var(--text-secondary)', fontWeight: '600' } }>Total</span>
                        <span style={ {
                            fontWeight: '700',
                            fontSize: '20px',
                            color: 'var(--accent-cyan)'
                        } }>
                            { formatCurrency( total ) }
                        </span>
                    </div>
                </div>

                {/* Email Input */ }
                <div className="form-group">
                    <label className="form-label">Send to Email</label>
                    <div style={ { display: 'flex', gap: '12px' } }>
                        <input
                            type="email"
                            className="form-input"
                            placeholder={ data.customerEmail || "Enter email address" }
                            value={ email }
                            onChange={ ( e ) => setEmail( e.target.value ) }
                            style={ { flex: 1 } }
                        />
                        <button
                            onClick={ shareViaEmail }
                            style={ {
                                padding: '0 24px',
                                background: 'var(--primary-gradient)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600'
                            } }
                        >
                            Send
                        </button>
                    </div>
                </div>

                {/* Share Buttons */ }
                <div className="share-buttons" style={ { marginTop: '24px' } }>
                    <button className="share-btn email" onClick={ shareViaEmail }>
                        <span className="share-icon">✉️</span>
                        <span>Email</span>
                    </button>
                    <button className="share-btn whatsapp" onClick={ shareViaWhatsApp }>
                        <span className="share-icon">💬</span>
                        <span>WhatsApp</span>
                    </button>
                    <button className="share-btn pdf" onClick={ sendEmailWithPdf } disabled={ isGeneratingPdf } style={ isGeneratingPdf ? {} : { background: 'linear-gradient(135deg, #11998e20, #38ef7d20)', borderColor: '#38ef7d' } }>
                        <span className="share-icon">📎</span>
                        <span>{ isGeneratingPdf ? 'Sending...' : 'Send PDF' }</span>
                    </button>
                    <button className="share-btn link" onClick={ copyLink }>
                        <span className="share-icon">🔗</span>
                        <span>Copy Link</span>
                    </button>
                </div>

                {/* Shareable Link */ }
                { shareLink && (
                    <div style={ { marginTop: '20px' } }>
                        <label className="form-label">Shareable Link</label>
                        <div style={ {
                            background: 'var(--bg-tertiary)',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            wordBreak: 'break-all',
                            border: '1px solid rgba(255,255,255,0.1)'
                        } }>
                            { shareLink }
                        </div>
                    </div>
                ) }

                {/* Download Option */ }
                <div style={ {
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                } }>
                    <p style={ {
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        marginBottom: '12px'
                    } }>
                        Need a PDF? Go back to the preview and click "Download PDF"
                    </p>
                    <button
                        onClick={ onClose }
                        style={ {
                            padding: '12px 32px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '14px'
                        } }
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
