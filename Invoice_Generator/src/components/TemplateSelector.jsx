import { useState } from 'react';

const TEMPLATES = {
    modern: {
        id: 'modern',
        name: 'Modern',
        description: 'Clean with gradient accents',
        colors: [ '#667eea', '#764ba2' ],
        preview: '🎨'
    },
    classic: {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional professional',
        colors: [ '#2c3e50', '#34495e' ],
        preview: '📜'
    },
    minimal: {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple, lots of whitespace',
        colors: [ '#000000', '#666666' ],
        preview: '⬜'
    },
    bold: {
        id: 'bold',
        name: 'Bold',
        description: 'Eye-catching strong colors',
        colors: [ '#e74c3c', '#c0392b' ],
        preview: '🔴'
    },
    corporate: {
        id: 'corporate',
        name: 'Corporate',
        description: 'Business-oriented design',
        colors: [ '#0066cc', '#004499' ],
        preview: '💼'
    },
    creative: {
        id: 'creative',
        name: 'Creative',
        description: 'For creative industries',
        colors: [ '#9b59b6', '#8e44ad' ],
        preview: '🎭'
    }
};

const TemplateSelector = ( { value, onChange } ) =>
{
    const [ expanded, setExpanded ] = useState( false );

    return (
        <div className="form-group">
            <label className="form-label">Invoice Template</label>

            {/* Current Selection */ }
            <button
                type="button"
                onClick={ () => setExpanded( !expanded ) }
                style={ {
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                } }
            >
                <div style={ { display: 'flex', alignItems: 'center', gap: '12px' } }>
                    <span style={ { fontSize: '24px' } }>{ TEMPLATES[ value ]?.preview }</span>
                    <div>
                        <div style={ { fontWeight: '600' } }>{ TEMPLATES[ value ]?.name }</div>
                        <div style={ { fontSize: '12px', color: 'var(--text-muted)' } }>
                            { TEMPLATES[ value ]?.description }
                        </div>
                    </div>
                </div>
                <span style={ { transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' } }>
                    ▼
                </span>
            </button>

            {/* Template Options */ }
            { expanded && (
                <div style={ {
                    marginTop: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                } }>
                    { Object.entries( TEMPLATES ).map( ( [ id, template ] ) => (
                        <button
                            key={ id }
                            type="button"
                            onClick={ () =>
                            {
                                onChange( id );
                                setExpanded( false );
                            } }
                            style={ {
                                background: value === id
                                    ? `linear-gradient(135deg, ${ template.colors[ 0 ] }, ${ template.colors[ 1 ] })`
                                    : 'var(--bg-tertiary)',
                                border: value === id
                                    ? '2px solid rgba(255,255,255,0.5)'
                                    : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                padding: '16px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                color: 'white',
                                transition: 'all 0.2s ease'
                            } }
                        >
                            <div style={ { fontSize: '28px', marginBottom: '8px' } }>
                                { template.preview }
                            </div>
                            <div style={ { fontWeight: '600', fontSize: '13px', color: 'white' } }>
                                { template.name }
                            </div>
                            <div style={ {
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.7)',
                                marginTop: '4px'
                            } }>
                                { template.description }
                            </div>
                            {/* Color preview */ }
                            <div style={ {
                                display: 'flex',
                                gap: '4px',
                                justifyContent: 'center',
                                marginTop: '8px'
                            } }>
                                { template.colors.map( ( color, i ) => (
                                    <div
                                        key={ i }
                                        style={ {
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '50%',
                                            background: color,
                                            border: '2px solid rgba(255,255,255,0.5)'
                                        } }
                                    />
                                ) ) }
                            </div>
                        </button>
                    ) ) }
                </div>
            ) }
        </div>
    );
};

export default TemplateSelector;
