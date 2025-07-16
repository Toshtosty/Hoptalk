import { Loader, LoaderIcon } from 'lucide-react'
import React from 'react'
import { useThemeStore } from '../store/useThemeStore.js'
const PageLoader = () => {

  // This component can be used to show a loading state while data is being fetched
  const {theme} = useThemeStore();
  return (
    <div className='min-h-screen flex items-center justify-center' data-theme={theme}>
      <LoaderIcon className='size-10 text-primary animate-spin' />
      {/* <span className='text-primary font-semibold ml-2'>Loading...</span> */}
        </div>
  )
}

export default PageLoader