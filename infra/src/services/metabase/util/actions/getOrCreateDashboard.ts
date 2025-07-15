async function getOrCreateDashboard({
  mbToken,
  collectionId,
  databaseId,
}: {
  mbToken: string
  collectionId: string
  databaseId: string
}) {
  console.log("🔍 Checking if dashboard 'Sodium - Dashboard' exists...")

  // Fetch existing dashboards
  const dashboardsRes = await fetch(`${METABASE_URL}/api/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': mbToken,
    },
  })

  if (!dashboardsRes.ok) {
    console.error('❌ Failed to fetch dashboards:', await dashboardsRes.text())
    return
  }

  const dashboards = await dashboardsRes.json()
  let dashboardId
  const existingDashboard = dashboards.find(
    (d) => d.name === 'Sodium - Dashboard',
  )

  if (existingDashboard) {
    console.log(
      `✅ Dashboard 'Sodium - Dashboard' already exists (ID: ${existingDashboard.id}).`,
    )
    dashboardId = existingDashboard.id
  } else {
    console.log("🛠 Creating dashboard 'Sodium - Dashboard'...")

    // Create new dashboard
    const createRes = await fetch(`${METABASE_URL}/api/dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': mbToken,
      },
      body: JSON.stringify({
        name: 'Sodium - Dashboard',
        collection_id: collectionId,
      }),
    })

    if (!createRes.ok) {
      console.error('❌ Failed to create dashboard:', await createRes.text())
      return null
    }

    const dashboardData = await createRes.json()
    dashboardId = dashboardData.id
    console.log(
      `✅ Dashboard 'Sodium - Dashboard' created (ID: ${dashboardId}).`,
    )
  }

  // Define the layout for the dashboard cards
  const layout = [
    // Top metrics (full width, 4 items)
    {
      id: 100,
      card_id: questionIds.accounts,
      row: 0,
      col: 0,
      size_x: 6,
      size_y: 3,
      dashboard_tab_id: 1,
    },
    {
      id: 101,
      card_id: questionIds.posts,
      row: 0,
      col: 6,
      size_x: 6,
      size_y: 3,
      dashboard_tab_id: 1,
    },
    {
      id: 102,
      card_id: questionIds.privateMessages,
      row: 0,
      col: 12,
      size_x: 6,
      size_y: 3,
      dashboard_tab_id: 1,
    },
    {
      id: 103,
      card_id: questionIds.comments,
      row: 0,
      col: 18,
      size_x: 6,
      size_y: 3,
      dashboard_tab_id: 1,
    },

    // Created Accounts This Month (left side, half width)
    {
      id: 200,
      card_id: questionIds.createdAccounts,
      row: 2,
      col: 0,
      size_x: 12,
      size_y: 4,
      dashboard_tab_id: 1,
    },

    // AVG user creation month
    {
      id: 201,
      card_id: questionIds.avgUserCreationDay,
      row: 2,
      col: 13,
      size_x: 12,
      size_y: 4,
      dashboard_tab_id: 1,
    },

    // Accumulated Accounts (right side, half width)
    {
      id: 300,
      card_id: questionIds.accumulatedAccounts,
      row: 3,
      col: 0,
      size_x: 24,
      size_y: 8,
      dashboard_tab_id: 1,
    },
  ]

  // Update the dashboard with the defined layout
  const updateRes = await fetch(
    `${METABASE_URL}/api/dashboard/${dashboardId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': mbToken,
      },
      body: JSON.stringify({
        name: 'Sodium - Dashboard',
        dashcards: layout,
        width: 'full',
        tabs: [
          {
            id: 1,
            name: 'User Acquisition',
          },
        ],
      }),
    },
  )

  if (updateRes.ok) {
    console.log('✅ Dashboard updated with new cards.')
  } else {
    console.error('❌ Failed to update dashboard:', await updateRes.text())
  }

  return dashboardId
}
