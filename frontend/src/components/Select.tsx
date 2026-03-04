"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps {
    id?: string;
    value: string | number | undefined;
    onChange: (value: string | number | undefined) => void;
    options: Option[];
    placeholder?: string;
    /** Ancho mínimo del componente */
    minWidth?: number;
}

export function Select({
    id,
    value,
    onChange,
    options,
    placeholder = "Seleccionar",
    minWidth = 160,
}: SelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selectedLabel =
        options.find((o) => o.value === value)?.label ?? placeholder;

    // Cerrar al hacer clic fuera
    useEffect(() => {
        function handle(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    return (
        <div ref={ref} className="relative" style={{ minWidth }}>
            {/* Botón que muestra el valor seleccionado */}
            <button
                id={id}
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="input flex items-center justify-between gap-2 cursor-pointer text-left"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span
                    style={{
                        color: value !== undefined ? "#DCCAE9" : "rgba(220,202,233,0.38)",
                        fontSize: "0.875rem",
                    }}
                >
                    {selectedLabel}
                </span>
                <ChevronDown
                    size={15}
                    style={{
                        color: "rgba(220,202,233,0.4)",
                        flexShrink: 0,
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                    }}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <ul
                    role="listbox"
                    className="absolute z-50 mt-1 w-full overflow-auto rounded-xl py-1"
                    style={{
                        background: "#1a0f2e",
                        border: "1px solid rgba(114,76,157,0.45)",
                        boxShadow: "0 8px 32px rgba(11,2,5,0.6)",
                        maxHeight: "220px",
                    }}
                >
                    {/* Opción "vacía" / placeholder */}
                    <li
                        role="option"
                        aria-selected={value === undefined}
                        onClick={() => { onChange(undefined); setOpen(false); }}
                        className="flex items-center justify-between px-3 py-2 cursor-pointer text-sm transition-colors"
                        style={{
                            color:
                                value === undefined
                                    ? "#DCCAE9"
                                    : "rgba(220,202,233,0.5)",
                            background:
                                value === undefined
                                    ? "rgba(147,86,160,0.18)"
                                    : "transparent",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(147,86,160,0.12)")}
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                            value === undefined ? "rgba(147,86,160,0.18)" : "transparent")
                        }
                    >
                        {placeholder}
                        {value === undefined && <Check size={14} style={{ color: "#9356A0" }} />}
                    </li>

                    {options.map((opt) => {
                        const selected = opt.value === value;
                        return (
                            <li
                                key={opt.value}
                                role="option"
                                aria-selected={selected}
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className="flex items-center justify-between px-3 py-2 cursor-pointer text-sm transition-colors"
                                style={{
                                    color: selected ? "#DCCAE9" : "rgba(220,202,233,0.75)",
                                    background: selected ? "rgba(147,86,160,0.18)" : "transparent",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = "rgba(147,86,160,0.12)")
                                }
                                onMouseLeave={(e) =>
                                (e.currentTarget.style.background = selected
                                    ? "rgba(147,86,160,0.18)"
                                    : "transparent")
                                }
                            >
                                {opt.label}
                                {selected && <Check size={14} style={{ color: "#9356A0" }} />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
