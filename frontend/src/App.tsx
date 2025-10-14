import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import {Button, ButtonGroup} from "@heroui/button";
import {Alert} from "@heroui/alert";


function App() {
  const [count, setCount] = useState(0)
  const title = "This is an alert";
  const description = "Thanks for subscribing to our newsletter!";

  return (
    <>
      
      <Button  color="primary">Button</Button>
      <div className="flex items-center justify-center w-full">
        <Alert hideIcon description={description} title={title} />
      </div>
      
    </>
  )
}

export default App
