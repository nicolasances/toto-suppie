import { useState } from 'react';

import './TouchableOpacity.css';
import { transform } from 'next/dist/build/swc/generated-native';

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

    if (props.onPress) props.onPress()

  }

  let style = 'touchable-opacity';
  if (props.className) style += ' ' + props.className;
  if (pressed) style += ' pressed';

  return (
    <div className={style} style={{
      ...props.style,
      transform: pressed ? "scale(0.95)" : "scale(1)",
    }}
      onClick={handleClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {props.children}
    </div>
  )
}
