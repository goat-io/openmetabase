import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Removed the import from './api/api' as the definitions will be moved into this file.
import { MetabaseDashboard } from './components/MetabaseDashboard' // Import the new MetabaseDashboard component

// Initialize a new QueryClient instance outside the component to prevent re-creation on re-renders.
// This client manages caching, refetching, and state for your queries and mutations.
const queryClient = new QueryClient()

function App() {
  const [dashboardId, setDashboardId] = useState<string>('2') // State for the Metabase dashboard ID
  const [paramKey, setParamKey] = useState<string>('') // State for the key of a new parameter
  const [paramValue, setParamValue] = useState<string>('') // State for the value of a new parameter
  const [currentParams, setCurrentParams] = useState<Record<string, any>>({}) // State to store all current parameters
  const [showDashboard, setShowDashboard] = useState<boolean>(false) // State to control when to show the dashboard

  // The base URL for your backend's URL generation endpoint.
  // Make sure this matches your Express server's address.
  const backendUrl = 'http://127.0.0.1:3002' // Example: your Express backend URL

  /**
   * Handles the form submission to trigger showing the dashboard.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowDashboard(true) // Set state to true to render MetabaseDashboard
  }

  /**
   * Adds a new parameter to the `currentParams` state.
   * Only adds if both key and value are provided.
   */
  const handleAddParam = () => {
    if (paramKey && paramValue) {
      setCurrentParams((prev) => ({
        ...prev,
        [paramKey]: paramValue,
      }))
      setParamKey('') // Clear input fields after adding
      setParamValue('')
    }
  }

  /**
   * Removes a parameter from the `currentParams` state by its key.
   * @param {string} keyToRemove - The key of the parameter to remove.
   */
  const handleRemoveParam = (keyToRemove: string) => {
    setCurrentParams((prev) => {
      const newParams = { ...prev }
      delete newParams[keyToRemove] // Create a new object without the specified key
      return newParams
    })
  }

  return (
    // QueryClientProvider must wrap any components that use TanStack Query hooks.
    // It provides the `queryClient` instance to the entire component tree.
    <QueryClientProvider client={queryClient}>
      {/* Main container for the page.
          - `h-screen`: Ensures the div takes up the full height of the viewport.
          - `flex items-center justify-center`: Centers the content both vertically and horizontally.
          - `bg-gray-100`: Sets a light gray background.
          - `font-sans`: Applies a sans-serif font.
          - `p-4 sm:p-8`: Adds responsive padding.
      */}
      <div className='h-screen flex items-center justify-center bg-gray-100 font-sans p-4 sm:p-8'>
        {/* Inner content card.
            - `bg-white`: White background for the card.
            - `p-6 sm:p-8`: Responsive padding inside the card.
            - `rounded-lg shadow-xl`: Rounded corners and a subtle shadow for a modern look.
            - `w-full`: Takes full width within its flex container.
            - `max-w-md md:max-w-3xl lg:max-w-4xl`: Sets responsive maximum widths.
              - `max-w-md` for small screens, `max-w-3xl` for medium, `max-w-4xl` for large.
              This addresses the "displays half on the page" by allowing it to expand more horizontally.
        */}
        <div className='bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-3xl lg:max-w-4xl'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center'>
            Metabase Dashboard Embedder
          </h1>

          <form onSubmit={handleSubmit} className='space-y-4 mb-6'>
            <div>
              <label
                htmlFor='dashboardId'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Dashboard ID:
              </label>
              <input
                type='text'
                id='dashboardId'
                value={dashboardId}
                onChange={(e) => {
                  setDashboardId(e.target.value)
                  setShowDashboard(false) // Reset to hide dashboard on ID change
                }}
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='e.g., 1'
                required
              />
            </div>

            <div className='border border-gray-200 p-4 rounded-md'>
              <h3 className='text-base sm:text-lg font-semibold text-gray-700 mb-3'>
                Parameters
              </h3>
              <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-3'>
                <input
                  type='text'
                  value={paramKey}
                  onChange={(e) => setParamKey(e.target.value)}
                  placeholder='Parameter Key'
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
                <input
                  type='text'
                  value={paramValue}
                  onChange={(e) => setParamValue(e.target.value)}
                  placeholder='Parameter Value'
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
                <button
                  type='button'
                  onClick={handleAddParam}
                  className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out text-sm font-semibold'
                >
                  Add Param
                </button>
              </div>
              {Object.keys(currentParams).length > 0 && (
                <div className='space-y-2 mt-4'>
                  {Object.entries(currentParams).map(([key, value]) => (
                    <div
                      key={key}
                      className='flex justify-between items-center bg-gray-50 p-2 rounded-md'
                    >
                      <span className='font-medium text-gray-800'>{key}:</span>
                      <span className='text-gray-600 break-all'>
                        {String(value)}
                      </span>
                      <button
                        type='button'
                        onClick={() => handleRemoveParam(key)}
                        className='ml-2 text-red-500 hover:text-red-700 text-sm'
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {Object.keys(currentParams).length === 0 && (
                <p className='text-gray-500 text-sm italic'>
                  No parameters added yet.
                </p>
              )}
            </div>

            <button
              type='submit'
              className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold'
            >
              Load Dashboard
            </button>
          </form>

          {/* Render the MetabaseDashboard component only when showDashboard is true */}
          {showDashboard && (
            <div className='mt-6'>
              <MetabaseDashboard
                dashboardId={dashboardId}
                params={currentParams}
                urlGeneratorBaseUrl={backendUrl}
                onEvent={(e) => {
                  console.log(e)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
