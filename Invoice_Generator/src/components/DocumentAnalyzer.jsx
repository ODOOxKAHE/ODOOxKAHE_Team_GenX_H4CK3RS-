import { useState, useCallback, useRef } from 'react';
import { createWorker } from 'tesseract.js';

const DocumentAnalyzer = ({ onExtractData, showToast }) => {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [ocrText, setOcrText] = useState('');
    const [extractedData, setExtractedData] = useState(null);
    const [queries, setQueries] = useState([]);
    const [currentQuery, setCurrentQuery] = useState('');
    const fileInputRef = useRef(null);

    const quickQueries = [
        "What is the total amount?",
        "Who is the vendor?",
        "What is the invoice number?",
        "List all items",
        "What is the date?",
        "What taxes are applied?"
    ];

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    }, []);

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    }, []);

    const processFile = async (file) => {
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        setIsProcessing(true);
        setProcessingStep('Initializing OCR engine...');
        setOcrText('');
        setExtractedData(null);
        setQueries([]);

        try {
            // Initialize Tesseract worker
            setProcessingStep('Loading OCR engine...');
            const worker = await createWorker('eng');

            setProcessingStep('Analyzing document...');
            const { data: { text } } = await worker.recognize(file);

            setOcrText(text);
            setProcessingStep('Extracting structured data...');

            // Extract structured data
            const extracted = extractStructuredData(text);
            setExtractedData(extracted);

            await worker.terminate();

            showToast('Document analyzed successfully!', 'success');
        } catch (error) {
            console.error('OCR Error:', error);
            showToast('Error analyzing document. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
            setProcessingStep('');
        }
    };

    const extractStructuredData = (text) => {
        const data = {
            invoiceNumber: '',
            date: '',
            vendor: '',
            total: '',
            items: [],
            rawText: text
        };

        const lines = text.split('\n').filter(line => line.trim());

        // Extract invoice number
        const invoicePatterns = [
            /invoice\s*#?\s*:?\s*([A-Z0-9-]+)/i,
            /inv\s*#?\s*:?\s*([A-Z0-9-]+)/i,
            /bill\s*#?\s*:?\s*([A-Z0-9-]+)/i,
            /#\s*([A-Z0-9-]+)/i
        ];
        for (const pattern of invoicePatterns) {
            const match = text.match(pattern);
            if (match) {
                data.invoiceNumber = match[1];
                break;
            }
        }

        // Extract date
        const datePatterns = [
            /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
            /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
            /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})/i
        ];
        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                data.date = match[1];
                break;
            }
        }

        // Extract amounts (look for currency patterns)
        const amountPatterns = [
            /total\s*:?\s*₹?\$?\s*([\d,]+\.?\d*)/i,
            /grand\s*total\s*:?\s*₹?\$?\s*([\d,]+\.?\d*)/i,
            /amount\s*due\s*:?\s*₹?\$?\s*([\d,]+\.?\d*)/i,
            /₹\s*([\d,]+\.?\d*)/,
            /\$\s*([\d,]+\.?\d*)/
        ];
        for (const pattern of amountPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.total = match[1];
                break;
            }
        }

        // Try to extract vendor/company name (usually at the top)
        if (lines.length > 0) {
            // First non-empty line is often the company name
            const potentialVendor = lines[0].trim();
            if (potentialVendor.length > 2 && potentialVendor.length < 100) {
                data.vendor = potentialVendor;
            }
        }

        // Extract potential line items (lines with amounts)
        const itemPattern = /(.+?)\s+(\d+)\s*[xX×]?\s*₹?\$?\s*([\d,]+\.?\d*)/;
        for (const line of lines) {
            const match = line.match(itemPattern);
            if (match) {
                data.items.push({
                    description: match[1].trim(),
                    quantity: parseInt(match[2]),
                    price: parseFloat(match[3].replace(',', ''))
                });
            }
        }

        return data;
    };

    const handleQuery = (query) => {
        if (!extractedData || !query.trim()) return;

        const answer = processQuery(query, extractedData);
        setQueries(prev => [...prev, { question: query, answer }]);
        setCurrentQuery('');
    };

    const processQuery = (query, data) => {
        const q = query.toLowerCase();

        // Total amount queries
        if (q.includes('total') || q.includes('amount') || q.includes('price') || q.includes('cost')) {
            if (data.total) {
                return `The total amount is ₹${data.total}`;
            }
            return "I couldn't find a clear total amount in this document.";
        }

        // Vendor queries
        if (q.includes('vendor') || q.includes('company') || q.includes('seller') || q.includes('from')) {
            if (data.vendor) {
                return `The vendor/company appears to be: ${data.vendor}`;
            }
            return "I couldn't identify a clear vendor name in this document.";
        }

        // Invoice number queries
        if (q.includes('invoice') || q.includes('number') || q.includes('bill')) {
            if (data.invoiceNumber) {
                return `The invoice number is: ${data.invoiceNumber}`;
            }
            return "I couldn't find an invoice number in this document.";
        }

        // Date queries
        if (q.includes('date') || q.includes('when')) {
            if (data.date) {
                return `The date on the document is: ${data.date}`;
            }
            return "I couldn't find a clear date in this document.";
        }

        // Items queries
        if (q.includes('item') || q.includes('product') || q.includes('list') || q.includes('bought') || q.includes('purchased')) {
            if (data.items.length > 0) {
                const itemList = data.items.map(item =>
                    `• ${item.description} (Qty: ${item.quantity}, ₹${item.price})`
                ).join('\n');
                return `Found ${data.items.length} items:\n${itemList}`;
            }
            return "I couldn't extract specific line items from this document.";
        }

        // Tax queries
        if (q.includes('tax') || q.includes('gst') || q.includes('vat')) {
            const taxMatch = data.rawText.match(/(?:tax|gst|vat)\s*:?\s*₹?\$?\s*([\d,]+\.?\d*)/i);
            if (taxMatch) {
                return `The tax amount appears to be: ₹${taxMatch[1]}`;
            }
            const taxPercentMatch = data.rawText.match(/(\d+)\s*%\s*(?:tax|gst|vat)/i);
            if (taxPercentMatch) {
                return `The document mentions a ${taxPercentMatch[1]}% tax rate.`;
            }
            return "I couldn't find specific tax information in this document.";
        }

        // General search in raw text
        const words = q.split(' ').filter(w => w.length > 3);
        for (const word of words) {
            if (data.rawText.toLowerCase().includes(word)) {
                const context = extractContext(data.rawText, word);
                if (context) {
                    return `Found relevant text: "${context}"`;
                }
            }
        }

        return "I couldn't find specific information about that in this document. Try asking about the total, vendor, invoice number, date, or items.";
    };

    const extractContext = (text, keyword) => {
        const index = text.toLowerCase().indexOf(keyword.toLowerCase());
        if (index === -1) return null;
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + keyword.length + 50);
        return '...' + text.slice(start, end).trim() + '...';
    };

    const handleUseData = () => {
        if (extractedData) {
            const invoiceData = {
                invoiceNumber: extractedData.invoiceNumber || '',
                customerName: extractedData.vendor || '',
                items: extractedData.items.length > 0
                    ? extractedData.items.map((item, i) => ({
                        id: i + 1,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price
                    }))
                    : [{ id: 1, description: '', quantity: 1, price: 0 }]
            };
            onExtractData(invoiceData);
        }
    };

    const clearDocument = () => {
        setImage(null);
        setImagePreview(null);
        setOcrText('');
        setExtractedData(null);
        setQueries([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            {/* Processing Overlay */}
            {isProcessing && (
                <div className="processing-overlay">
                    <div className="processing-content">
                        <div className="processing-spinner"></div>
                        <div className="processing-text">Analyzing Document</div>
                        <div className="processing-subtext">{processingStep}</div>
                    </div>
                </div>
            )}

            {/* Upload Section */}
            <div className="glass-card">
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title-icon">📷</span>
                        Document Scanner
                    </h2>
                    {imagePreview && (
                        <button
                            onClick={clearDocument}
                            style={{
                                padding: '8px 16px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            Clear & Upload New
                        </button>
                    )}
                </div>

                {!imagePreview ? (
                    <div
                        className="upload-zone"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="upload-icon">📄</div>
                        <div className="upload-title">Drop your document here</div>
                        <div className="upload-subtitle">or click to browse files</div>
                        <div className="upload-subtitle" style={{ marginTop: '12px', fontSize: '12px' }}>
                            Supports: JPG, PNG, PDF images
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="upload-input"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </div>
                ) : (
                    <>
                        <div className="document-preview">
                            <img src={imagePreview} alt="Uploaded document" className="document-image" />
                            <div className="document-overlay">
                                <button className="overlay-btn" onClick={() => fileInputRef.current?.click()}>
                                    📷 Change
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="upload-input"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {/* Extracted Data */}
                        {extractedData && (
                            <div className="extracted-data">
                                <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                                    📊 Extracted Information
                                </h3>
                                {extractedData.invoiceNumber && (
                                    <div className="extracted-item">
                                        <span className="extracted-label">Invoice #</span>
                                        <span className="extracted-value">{extractedData.invoiceNumber}</span>
                                    </div>
                                )}
                                {extractedData.vendor && (
                                    <div className="extracted-item">
                                        <span className="extracted-label">Vendor</span>
                                        <span className="extracted-value">{extractedData.vendor}</span>
                                    </div>
                                )}
                                {extractedData.date && (
                                    <div className="extracted-item">
                                        <span className="extracted-label">Date</span>
                                        <span className="extracted-value">{extractedData.date}</span>
                                    </div>
                                )}
                                {extractedData.total && (
                                    <div className="extracted-item">
                                        <span className="extracted-label">Total Amount</span>
                                        <span className="extracted-value" style={{ color: 'var(--accent-cyan)' }}>
                                            ₹{extractedData.total}
                                        </span>
                                    </div>
                                )}
                                {extractedData.items.length > 0 && (
                                    <div className="extracted-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <span className="extracted-label" style={{ marginBottom: '8px' }}>
                                            Items Found ({extractedData.items.length})
                                        </span>
                                        {extractedData.items.slice(0, 3).map((item, i) => (
                                            <div key={i} className="extracted-value" style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                • {item.description} × {item.quantity}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    className="btn-primary"
                                    onClick={handleUseData}
                                    style={{ marginTop: '16px' }}
                                >
                                    <span>✨</span> Use Data in Invoice
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Query Section */}
            <div className="glass-card">
                <div className="card-header">
                    <h2 className="card-title">
                        <span className="card-title-icon">💬</span>
                        Ask About Document
                    </h2>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    {quickQueries.map((q, i) => (
                        <button
                            key={i}
                            className="quick-action-btn"
                            onClick={() => handleQuery(q)}
                            disabled={!extractedData}
                        >
                            {q}
                        </button>
                    ))}
                </div>

                {/* Query Input */}
                <div className="query-section">
                    <div className="query-input-container">
                        <input
                            type="text"
                            className="query-input"
                            placeholder={extractedData ? "Ask a question about this document..." : "Upload a document first..."}
                            value={currentQuery}
                            onChange={(e) => setCurrentQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleQuery(currentQuery)}
                            disabled={!extractedData}
                        />
                        <button
                            className="query-btn"
                            onClick={() => handleQuery(currentQuery)}
                            disabled={!extractedData || !currentQuery.trim()}
                        >
                            →
                        </button>
                    </div>

                    {/* Query History */}
                    <div className="query-history">
                        {queries.map((q, i) => (
                            <div key={i} className="query-item">
                                <div className="query-question">
                                    <span>❓</span> {q.question}
                                </div>
                                <div className="query-answer" style={{ whiteSpace: 'pre-wrap' }}>
                                    {q.answer}
                                </div>
                            </div>
                        ))}
                        {!extractedData && !isProcessing && (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                <div>Upload a document to start analyzing</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DocumentAnalyzer;
