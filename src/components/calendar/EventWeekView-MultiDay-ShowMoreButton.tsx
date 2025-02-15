import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";

interface ShowMoreButtonProps {
    style: React.CSSProperties;
    onClick: () => void;
}

const ShowMoreButton: React.FC<ShowMoreButtonProps> = ({ style, onClick }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [buttonWidth, setButtonWidth] = useState(0);

    useEffect(() => {
        if (buttonRef.current) {
            // Measure the width of the button
            setButtonWidth(buttonRef.current.getBoundingClientRect().width);
        }
    }, [style]);

    // Define a threshold, for example 80px
    const text = buttonWidth > 80 ? "Mostrar más" : "...";

    return (
        <Button
            ref={buttonRef}
            type="button"
            variant="outline"
            className="absolute h-[20px] flex items-center justify-center border-none"
            onClick={onClick}
            style={style}
        >
            <span>{text}</span>
        </Button>
    );
};

export default ShowMoreButton;
