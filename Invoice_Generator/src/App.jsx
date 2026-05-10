import { useState, useCallback, useEffect } from 'react';
import './App.css';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import ShareModal from './components/ShareModal';
import NotificationModal from './components/NotificationModal';
import PaymentModal from './components/PaymentModal';
import CryptoPaymentModal from './components/CryptoPaymentModal';
import InvoiceHistory from './components/InvoiceHistory';

const API_BASE = 'http://localhost:3001/api';

const CURRENCIES = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥',
  AUD: 'A$', CAD: 'C$', AED: 'د.إ', SGD: 'S$'
};

function App ()
{
  const [ mode, setMode ] = useState( 'generate' );
  const [ invoiceData, setInvoiceData ] = useState( {
    companyName: 'Your Company Name',
    companyAddress: '123 Business Street\nCity, State 12345',
    companyEmail: 'jayadithya.g10@gmail.com',
    companyPhone: '+91 7550293777',
    companyLogo: null,
    invoiceNumber: `INV-${ Date.now().toString().slice( -6 ) }`,
    invoiceDate: new Date().toISOString().split( 'T' )[ 0 ],
    dueDate: new Date( Date.now() + 30 * 24 * 60 * 60 * 1000 ).toISOString().split( 'T' )[ 0 ],
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    customerPhone: '+917550293777',
    items: [ { id: 1, description: '', quantity: 1, price: 0 } ],
    taxRate: 18,
    notes: 'Thank you for your business!',
    currency: 'INR',
    template: 'modern',
    // Discount configuration
    discount: {
      type: 'percentage', // 'percentage' or 'fixed'
      value: 0
    },
    // Crypto wallet addresses for invoice
    cryptoWallets: {
      eth: { address: '', enabled: false },
      btc: { address: '', enabled: false },
      sol: { address: '', enabled: false }
    },
    // Gift the Customer configuration
    giftConfig: {
      enabled: false,
      type: 'voucher', // voucher, 1plus1, buy3get2, movie, travel, festive, coupon, referral, custom
      message: '',
      link: ''
    },
    // Support/Crowdfunding configuration  
    supportConfig: {
      enabled: false,
      title: 'Buy Me a Coffee',
      message: '',
      link: ''
    },
    // Business Links configuration
    businessLinks: {
      enabled: false,
      businessCard: '',
      arBusinessCard: '',
      linkedIn: '',
      listingWebsite: '',
      landingPage: ''
    },
    showPaymentOnInvoice: false, // Only show payment QR when explicitly enabled
    showCryptoPayment: false
  } );

  const [ showShareModal, setShowShareModal ] = useState( false );
  const [ showNotificationModal, setShowNotificationModal ] = useState( false );
  const [ showPaymentModal, setShowPaymentModal ] = useState( false );
  const [ showCryptoModal, setShowCryptoModal ] = useState( false );
  const [ showHistoryModal, setShowHistoryModal ] = useState( false );
  const [ toast, setToast ] = useState( null );
  const [ theme, setTheme ] = useState( () =>
  {
    return localStorage.getItem( 'theme' ) || 'dark';
  } );

  // Currency conversion state
  const [ viewCurrency, setViewCurrency ] = useState( 'INR' );
  const [ convertedTotal, setConvertedTotal ] = useState( null );
  const [ exchangeRate, setExchangeRate ] = useState( null );
  const [ conversionLoading, setConversionLoading ] = useState( false );

  // Apply theme to document
  useEffect( () =>
  {
    document.documentElement.setAttribute( 'data-theme', theme );
    localStorage.setItem( 'theme', theme );
  }, [ theme ] );

  const toggleTheme = () =>
  {
    setTheme( prev => prev === 'dark' ? 'light' : 'dark' );
  };

  // Load from localStorage on mount
  useEffect( () =>
  {
    const saved = localStorage.getItem( 'lastInvoice' );
    if ( saved )
    {
      try
      {
        const parsed = JSON.parse( saved );
        setInvoiceData( prev => ( { ...prev, ...parsed } ) );
      } catch ( e ) { }
    }
  }, [] );

  // Auto-save to localStorage
  useEffect( () =>
  {
    localStorage.setItem( 'lastInvoice', JSON.stringify( invoiceData ) );
  }, [ invoiceData ] );

  // Currency conversion effect - fetch live rates when viewCurrency differs from invoice currency
  useEffect( () =>
  {
    const fetchConversion = async () =>
    {
      const total = calculateTotal();
      if ( viewCurrency === invoiceData.currency || total === 0 )
      {
        setConvertedTotal( null );
        setExchangeRate( null );
        return;
      }

      setConversionLoading( true );
      try
      {
        const response = await fetch(
          `${ API_BASE }/currency/convert?amount=${ total }&from=${ invoiceData.currency }&to=${ viewCurrency }`
        );
        const data = await response.json();
        if ( data.success )
        {
          setConvertedTotal( data.to.amount );
          setExchangeRate( data.rate );
        }
      } catch ( error )
      {
        console.error( 'Currency conversion failed:', error );
      }
      setConversionLoading( false );
    };

    fetchConversion();
  }, [ viewCurrency, invoiceData.currency, invoiceData.items, invoiceData.taxRate ] );

  const showToast = useCallback( ( message, type = 'success' ) =>
  {
    setToast( { message, type } );
    setTimeout( () => setToast( null ), 3000 );
  }, [] );

  const updateInvoiceData = useCallback( ( updates ) =>
  {
    setInvoiceData( prev => ( { ...prev, ...updates } ) );
  }, [] );

  const addLineItem = useCallback( () =>
  {
    setInvoiceData( prev => ( {
      ...prev,
      items: [ ...prev.items, { id: Date.now(), description: '', quantity: 1, price: 0 } ]
    } ) );
  }, [] );

  const updateLineItem = useCallback( ( id, field, value ) =>
  {
    setInvoiceData( prev => ( {
      ...prev,
      items: prev.items.map( item =>
        item.id === id ? { ...item, [ field ]: value } : item
      )
    } ) );
  }, [] );

  const deleteLineItem = useCallback( ( id ) =>
  {
    setInvoiceData( prev => ( {
      ...prev,
      items: prev.items.filter( item => item.id !== id )
    } ) );
  }, [] );

  const calculateSubtotal = () =>
  {
    return invoiceData.items.reduce( ( sum, item ) => sum + ( item.quantity * item.price ), 0 );
  };

  const calculateTax = () =>
  {
    return calculateSubtotal() * ( invoiceData.taxRate / 100 );
  };

  const calculateDiscount = () =>
  {
    const subtotal = calculateSubtotal();
    const discount = invoiceData.discount || { type: 'percentage', value: 0 };
    if ( discount.type === 'percentage' )
    {
      return subtotal * ( discount.value / 100 );
    }
    return discount.value || 0;
  };

  const calculateTotal = () =>
  {
    return calculateSubtotal() + calculateTax() - calculateDiscount();
  };

  const handleExtractedData = useCallback( ( data ) =>
  {
    setInvoiceData( prev => ( {
      ...prev,
      ...data,
      items: data.items || prev.items
    } ) );
    setMode( 'generate' );
    showToast( 'Data extracted and loaded into invoice form!' );
  }, [ showToast ] );

  const saveInvoice = async () =>
  {
    const invoiceToSave = {
      ...invoiceData,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      savedAt: new Date().toISOString()
    };

    // Save to server
    try
    {
      await fetch( `${ API_BASE }/history/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { invoice: invoiceToSave } )
      } );
    } catch ( e ) { }

    // Also save to localStorage
    const history = JSON.parse( localStorage.getItem( 'invoiceHistory' ) || '[]' );
    const existingIndex = history.findIndex( i => i.invoiceNumber === invoiceToSave.invoiceNumber );
    if ( existingIndex >= 0 )
    {
      history[ existingIndex ] = invoiceToSave;
    } else
    {
      history.unshift( invoiceToSave );
    }
    localStorage.setItem( 'invoiceHistory', JSON.stringify( history.slice( 0, 50 ) ) );

    showToast( 'Invoice saved!', 'success' );
  };

  const loadInvoice = ( invoice ) =>
  {
    setInvoiceData( prev => ( { ...prev, ...invoice } ) );
  };

  const printInvoice = () =>
  {
    window.print();
  };

  const currencySymbol = CURRENCIES[ invoiceData.currency ] || '₹';

  return (
    <>
      <div className="app-background"></div>
      <div className="app-container">
        {/* Header */ }
        <header className="app-header">
          <div className="logo">
            <div className="logo-icon">📄</div>
            <div>
              <div className="logo-text">InvoiceAI</div>
              <div className="logo-subtitle">CRM Invoice Platform</div>
            </div>
          </div>

          <div className="mode-toggle">
            <button
              className={ `mode-btn ${ mode === 'generate' ? 'active' : '' }` }
              onClick={ () => setMode( 'generate' ) }
            >
              📤 Generate
            </button>
            <button
              className={ `mode-btn ${ mode === 'analyze' ? 'active' : '' }` }
              onClick={ () => setMode( 'analyze' ) }
            >
              📥 Analyze
            </button>
          </div>

          {/* Quick Actions */ }
          <div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
            {/* Theme Toggle */ }
            <button
              onClick={ toggleTheme }
              style={ {
                background: 'var(--bg-tertiary)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              } }
              title={ theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode' }
            >
              { theme === 'dark' ? '☀️' : '🌙' }
            </button>
            <button
              onClick={ () => setShowHistoryModal( true ) }
              style={ {
                background: 'var(--bg-tertiary)',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              } }
            >
              📋 History
            </button>
            <button
              onClick={ saveInvoice }
              style={ {
                background: 'var(--primary-gradient)',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              } }
            >
              💾 Save
            </button>
          </div>
        </header>

        {/* Main Content */ }
        <main className="main-content">
          { mode === 'generate' ? (
            <>
              <InvoiceForm
                data={ invoiceData }
                updateData={ updateInvoiceData }
                addLineItem={ addLineItem }
                updateLineItem={ updateLineItem }
                deleteLineItem={ deleteLineItem }
                subtotal={ calculateSubtotal() }
                tax={ calculateTax() }
                discount={ calculateDiscount() }
                total={ calculateTotal() }
                currencySymbol={ currencySymbol }
                onShare={ () => setShowShareModal( true ) }
                onNotify={ () => setShowNotificationModal( true ) }
                onPayment={ () => setShowPaymentModal( true ) }
                onCrypto={ () => setShowCryptoModal( true ) }
                onPrint={ printInvoice }
                viewCurrency={ viewCurrency }
                onViewCurrencyChange={ setViewCurrency }
              />
              <InvoicePreview
                data={ invoiceData }
                subtotal={ calculateSubtotal() }
                tax={ calculateTax() }
                discount={ calculateDiscount() }
                total={ calculateTotal() }
                currencySymbol={ currencySymbol }
                viewCurrency={ viewCurrency }
                convertedTotal={ convertedTotal }
                exchangeRate={ exchangeRate }
                conversionLoading={ conversionLoading }
              />
            </>
          ) : (
            <DocumentAnalyzer
              onExtractData={ handleExtractedData }
              showToast={ showToast }
            />
          ) }
        </main>

        {/* Modals */ }
        { showShareModal && (
          <ShareModal
            data={ invoiceData }
            total={ calculateTotal() }
            onClose={ () => setShowShareModal( false ) }
            showToast={ showToast }
          />
        ) }

        { showNotificationModal && (
          <NotificationModal
            data={ invoiceData }
            total={ calculateTotal() }
            subtotal={ calculateSubtotal() }
            tax={ calculateTax() }
            onClose={ () => setShowNotificationModal( false ) }
            showToast={ showToast }
          />
        ) }

        { showPaymentModal && (
          <PaymentModal
            data={ invoiceData }
            total={ calculateTotal() }
            subtotal={ calculateSubtotal() }
            tax={ calculateTax() }
            onClose={ () => setShowPaymentModal( false ) }
            showToast={ showToast }
            onAddToInvoice={ ( link ) =>
            {
              updateInvoiceData( { paymentLink: link, showPaymentOnInvoice: true } );
              setShowPaymentModal( false );
            } }
          />
        ) }

        { showCryptoModal && (
          <CryptoPaymentModal
            data={ invoiceData }
            total={ calculateTotal() }
            currency={ invoiceData.currency }
            onClose={ () => setShowCryptoModal( false ) }
            showToast={ showToast }
          />
        ) }

        { showHistoryModal && (
          <InvoiceHistory
            onLoadInvoice={ loadInvoice }
            showToast={ showToast }
            onClose={ () => setShowHistoryModal( false ) }
          />
        ) }

        {/* Toast */ }
        { toast && (
          <div className={ `toast ${ toast.type }` }>
            <span className="toast-icon">
              { toast.type === 'success' ? '✓' : '✕' }
            </span>
            <span className="toast-message">{ toast.message }</span>
          </div>
        ) }
      </div>
    </>
  );
}

export default App;
