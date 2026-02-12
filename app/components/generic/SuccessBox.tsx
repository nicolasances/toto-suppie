import './SuccessBox.css'
import Lottie from 'lottie-react'
import successAnim from '../../lottie/anim-success.json';

export function SuccessBox() {

    return (
        <div className="success-box">
            <div className="title">Congratulations!</div>
            <Lottie animationData={successAnim} loop={false} />
            <div className='text'>You're done!<br></br>You can run home now!</div>
        </div>
    )
}