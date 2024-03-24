import './SpeechBubble.css'

/**
 * Generic "speech-like" bubble to show text 
 */
export function SpeechBubble(props: { text: string | JSX.Element, textColor?: string }) {

    return (
        <div className="speech-bubble">
            <p style={{ color: props.textColor ? props.textColor : "var(--color-text-light)" }}>{props.text}</p>
        </div>
    )

}