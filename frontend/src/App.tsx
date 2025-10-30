import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import {Button, ButtonGroup} from "@heroui/button";
import {Alert} from "@heroui/alert";


function App() {
  
  const title = "This is an alert";
  const description = "Thanks for subscribing to our newsletter!";

  return (
    <>
      
      
      <div className="flex flex-col items-center justify-center w-full h-screen">
        <Alert className = "max-h-min" hideIcon description={description} title={title} />
        <Button  color="primary">Button3</Button>  
      </div>

      
    </>
  )
}

export default App
