import { useState, useRef, useEffect } from 'react';

const VoiceInput = ( { value, onChange, placeholder, type = 'text', className = 'form-input', style = {} } ) =>
{
    const [ isListening, setIsListening ] = useState( false );
    const [ isSupported, setIsSupported ] = useState( false );
    const recognitionRef = useRef( null );

    useEffect( () =>
    {
        // Check if Web Speech API is supported
        if ( 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window )
        {
            setIsSupported( true );
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-IN'; // Default to Indian English

            recognitionRef.current.onresult = ( event ) =>
            {
                const transcript = Array.from( event.results )
                    .map( result => result[ 0 ].transcript )
                    .join( '' );
                onChange( { target: { value: transcript } } );
            };

            recognitionRef.current.onend = () =>
            {
                setIsListening( false );
            };

            recognitionRef.current.onerror = ( event ) =>
            {
                console.error( 'Speech recognition error:', event.error );
                setIsListening( false );
            };
        }

        return () =>
        {
            if ( recognitionRef.current )
            {
                recognitionRef.current.stop();
            }
        };
    }, [ onChange ] );

    const toggleListening = () =>
    {
        if ( isListening )
        {
            recognitionRef.current?.stop();
            setIsListening( false );
        } else
        {
            recognitionRef.current?.start();
            setIsListening( true );
        }
    };

    return (
        <div style={ { position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' } }>
            <input
                type={ type }
                className={ className }
                value={ value }
                onChange={ onChange }
                placeholder={ placeholder }
                style={ { flex: 1, paddingRight: isSupported ? '40px' : '12px', ...style } }
            />
            { isSupported && (
                <button
                    type="button"
                    onClick={ toggleListening }
                    style={ {
                        position: 'absolute',
                        right: '8px',
                        background: isListening ? 'rgba(245, 87, 108, 0.3)' : 'transparent',
                        border: 'none',
                        color: isListening ? '#f5576c' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                    } }
                    title="Voice input"
                >
                    { isListening ? '🔴' : '🎤' }
                </button>
            ) }
        </div>
    );
};

export default VoiceInput;
