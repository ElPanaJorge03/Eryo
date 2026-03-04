/**
 * Logo de Eryó — SVG inline adaptado para fondo oscuro.
 * Cambios respecto al original:
 *  - Eliminado el rect de fondo claro (#F5F0EB)
 *  - Texto sombra: fill cambiado a #9356A0 con baja opacidad (era #2C1B47 invisible sobre oscuro)
 *  - Texto slogan: fill cambiado a #DCCAE9 (era #2C1B47 invisible sobre oscuro)
 *  - El resto de la paleta ya era compatible con fondo oscuro
 */
export function EryoLogo({ height = 80 }: { height?: number }) {
    const width = Math.round((height * 900) / 700);

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 900 700"
            width={width}
            height={height}
            aria-label="Eryó — Bisutería Artesanal"
            role="img"
        >
            <defs>
                <path id="arc-shadow" d="M 58,398 Q 454,322 858,398" />
                <path id="arc-main" d="M 50,390 Q 450,314 850,390" />
            </defs>

            {/* Hilos */}
            <line x1="70" y1="280" x2="405" y2="282" stroke="#9356A0" strokeWidth="5" strokeLinecap="round" />
            <line x1="505" y1="282" x2="840" y2="282" stroke="#9356A0" strokeWidth="5" strokeLinecap="round" />

            {/* Digen (flor central) */}
            <g transform="translate(455, 282)">
                <ellipse cx="0" cy="-32" rx="7" ry="12" fill="#724C9D" opacity="0.85" />
                <ellipse cx="0" cy="-32" rx="7" ry="12" fill="#724C9D" opacity="0.85" transform="rotate(45)" />
                <ellipse cx="0" cy="-32" rx="7" ry="12" fill="#724C9D" opacity="0.85" transform="rotate(90)" />
                <ellipse cx="0" cy="-32" rx="7" ry="12" fill="#724C9D" opacity="0.85" transform="rotate(135)" />
                <ellipse cx="0" cy="-32" rx="7" ry="12" fill="#724C9D" opacity="0.85" transform="rotate(180)" />
                <ellipse cx="0" cy="-32" rx="7" ry="12" fill="#724C9D" opacity="0.85" transform="rotate(225)" />
                <ellipse cx="0" cy="-32" rx="7" ry="12" fill="#724C9D" opacity="0.85" transform="rotate(270)" />
                <ellipse cx="0" cy="-32" rx="7" ry="12" fill="#724C9D" opacity="0.85" transform="rotate(315)" />
                <polygon points="0,-50 4,-34 0,-38 -4,-34" fill="#9356A0" />
                <polygon points="50,0 34,4 38,0 34,-4" fill="#9356A0" />
                <polygon points="0,50 4,34 0,38 -4,34" fill="#9356A0" />
                <polygon points="-50,0 -34,4 -38,0 -34,-4" fill="#9356A0" />
                <circle cx="0" cy="0" r="22" fill="none" stroke="#DCCAE9" strokeWidth="3" />
                <circle cx="0" cy="-15" r="3.5" fill="#DCCAE9" />
                <circle cx="10.6" cy="-10.6" r="3.5" fill="#DCCAE9" />
                <circle cx="15" cy="0" r="3.5" fill="#DCCAE9" />
                <circle cx="10.6" cy="10.6" r="3.5" fill="#DCCAE9" />
                <circle cx="0" cy="15" r="3.5" fill="#DCCAE9" />
                <circle cx="-10.6" cy="10.6" r="3.5" fill="#DCCAE9" />
                <circle cx="-15" cy="0" r="3.5" fill="#DCCAE9" />
                <circle cx="-10.6" cy="-10.6" r="3.5" fill="#DCCAE9" />
                <circle cx="0" cy="0" r="10" fill="#2C1B47" />
                <circle cx="0" cy="0" r="5" fill="#DCCAE9" />
            </g>

            {/* Texto sombra — adaptado a fondo oscuro (sombra en púrpura suave) */}
            <text
                fontFamily="Arial Black, sans-serif"
                fontWeight="900"
                fontSize="230"
                fill="#9356A0"
                opacity="0.18"
                letterSpacing="-6"
            >
                <textPath href="#arc-shadow" startOffset="50%" textAnchor="middle">
                    ERYÓ
                </textPath>
            </text>

            {/* Texto principal */}
            <text
                fontFamily="Arial Black, sans-serif"
                fontWeight="900"
                fontSize="230"
                fill="#724C9D"
                letterSpacing="-6"
            >
                <textPath href="#arc-main" startOffset="50%" textAnchor="middle">
                    ERYÓ
                </textPath>
            </text>

            {/* Eslogan — adaptado a fondo oscuro */}
            <text
                x="440" y="470"
                fontFamily="Georgia, serif"
                fontSize="26"
                fill="#DCCAE9"
                textAnchor="middle"
                letterSpacing="8"
                opacity="0.7"
            >
                BISUTERIA
            </text>
            <text
                x="440" y="504"
                fontFamily="Georgia, serif"
                fontSize="22"
                fill="#DCCAE9"
                textAnchor="middle"
                letterSpacing="6"
                opacity="0.5"
            >
                777 • LUCK
            </text>
        </svg>
    );
}
