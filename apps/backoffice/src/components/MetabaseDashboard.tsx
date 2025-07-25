import { FC, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { iframeResizer } from 'iframe-resizer'

// Define the props for the MetabaseDashboard component
export type MetabaseDashboardProps = {
  dashboardId: string
  // Optional parameters for the dashboard
  params?: Record<string, unknown>
  // The base URL of your backend that generates the embed URL
  urlGeneratorBaseUrl: string
  // Triggers events comming from the embedded Iframe
  onEvent?: (data: Record<string, unknown>) => void
  apiKey?: string
  sessionToken?: string
}

// Define the shape of the data expected from the backend
interface GetDashboardResponse {
  iframeUrl: string
  apiKey?: string
}

interface GetDashboardPayload {
  dashboard: string
  params: Record<string, unknown>
}

/**
 * API call function to fetch the Metabase dashboard embed URL.
 * This function is designed to be used by TanStack Query's useMutation.
 *
 * @param {GetDashboardPayload} payload - The dashboard ID and parameters.
 * @param {string} baseUrl - The base URL of the backend endpoint.
 * @returns {Promise<GetDashboardResponse>} - The response containing the iframe URL.
 */
const fetchDashboardUrl = async (
  payload: GetDashboardPayload,
  baseUrl: string,
): Promise<GetDashboardResponse> => {
  const response = await fetch(`${baseUrl}/get-dashboard`, {
    // Use baseUrl here
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to fetch dashboard URL')
  }

  return response.json()
}

/**
 * A reusable React component to embed a Metabase dashboard.
 * It handles fetching the embed URL from a backend and displaying it in an iframe.
 */
export const MetabaseDashboard: FC<MetabaseDashboardProps> = ({
  dashboardId,
  params = {}, // Default to an empty object if no params are provided
  urlGeneratorBaseUrl,
  onEvent,
  apiKey,
  sessionToken,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // useMutation hook to handle the API call for generating the dashboard URL.
  // The `mutationFn` is wrapped to pass the `urlGeneratorBaseUrl`.
  const { mutate, data, isPending, isError, error, isSuccess } = useMutation<
    GetDashboardResponse,
    Error,
    GetDashboardPayload
  >({
    mutationFn: (payload) => fetchDashboardUrl(payload, urlGeneratorBaseUrl),
  })

  const apiKeyToUse = apiKey || data?.apiKey

  useEffect(() => {
    const handleMetabaseActions = (e: MessageEvent) => {
      if (e.data.type === 'metabase-action') {
        onEvent?.(e.data)
      }
    }

    // Create a BroadcastChannel and listen for messages
    window.addEventListener('message', handleMetabaseActions)
    // Cleanup the BroadcastChannel when the component unmounts.
    return () => {
      window.removeEventListener('message', handleMetabaseActions)
    }
  }, [onEvent])

  // Handle session token
  useEffect(() => {
    const handleTokenRequest = (e: MessageEvent) => {
      if (e.data.type === 'get-session-token') {
        e.source?.postMessage(
          {
            type: 'set-session-token',
            sessionToken,
          },
          {
            targetOrigin: e.origin,
          },
        )
      }
    }

    // Create a BroadcastChannel and listen for messages
    window.addEventListener('message', handleTokenRequest)
    // Cleanup the BroadcastChannel when the component unmounts.
    return () => {
      window.removeEventListener('message', handleTokenRequest)
    }
  }, [sessionToken])

  // Handle api key
  useEffect(() => {
    const handleTokenRequest = (e: MessageEvent) => {
      if (e.data.type === 'get-api-key') {
        e.source?.postMessage(
          {
            type: 'set-api-key',
            apiKey: apiKeyToUse,
          },
          {
            targetOrigin: e.origin,
          },
        )
      }
    }

    // Create a BroadcastChannel and listen for messages
    window.addEventListener('message', handleTokenRequest)
    // Cleanup the BroadcastChannel when the component unmounts.
    return () => {
      window.removeEventListener('message', handleTokenRequest)
    }
  }, [apiKeyToUse])

  // Trigger the mutation when the component mounts or when props change.
  // This ensures the dashboard URL is fetched automatically.
  useEffect(() => {
    mutate({ dashboard: dashboardId, params })
  }, [dashboardId, params, urlGeneratorBaseUrl, mutate])

  if (isPending) {
    return (
      <div className='flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-md'>
        <p className='text-gray-600 font-medium'>Loading dashboard...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex items-center justify-center h-full min-h-[300px] bg-red-100 border border-red-400 text-red-700 p-4 rounded-md'>
        <strong className='font-bold'>Error loading dashboard:</strong>
        <span className='block sm:inline ml-2'>
          {error?.message || 'Something went wrong.'}
        </span>
      </div>
    )
  }

  if (isSuccess && data?.iframeUrl) {
    return (
      <div className='w-full bg-gray-200 rounded-md overflow-hidden'>
        <iframe
          ref={iframeRef}
          src={data.iframeUrl}
          allowTransparency={true}
          title={`Metabase Dashboard ${dashboardId}`}
          width='100%'
          height='100%'
          frameBorder='0'
          onLoad={() => {
            if (iframeRef.current) {
              iframeResizer({}, iframeRef.current)
            }
          }}
        />
      </div>
    )
  }

  // Fallback for cases where data is not yet available or mutation hasn't run
  return (
    <div className='flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-md'>
      <p className='text-gray-500'>
        Dashboard not loaded. Please check inputs.
      </p>
    </div>
  )
}
