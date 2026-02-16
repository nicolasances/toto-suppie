import { useState } from 'react';

import './TouchableOpacity.css';

interface TouchableOpacityProps {
  onPress?: () => void, 
  className?: string
  style?: any
  children: any
}

export function TouchableOpacity(props: TouchableOpacityProps) {

  const [pressed, setPressed] = useState(false)

  const handleClick = (event: any) => {

    event.stopPropagation();

    // Update the state, to show the press action
    setPressed(true)

    setTimeout(() => {

      setPressed(false);

      if (props.onPress) props.onPress()

    }, 100);

  }

  let style = 'touchable-opacity';
  if (props.className) style += ' ' + props.className;
  if (pressed) style += ' pressed';

  return (
    <div className={style} style={props.style} onClick={handleClick}>
      {props.children}
    </div>
  )
}
