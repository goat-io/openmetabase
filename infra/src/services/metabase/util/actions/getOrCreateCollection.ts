async function getOrCreateCollection(mbToken: string) {
  console.log("🔍 Checking if collection 'Sodium Analytics' exists...")

  // Fetch existing collections
  const collectionsRes = await fetch(`${METABASE_URL}/api/collection`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': mbToken,
    },
  })

  if (!collectionsRes.ok) {
    console.error(
      '❌ Failed to fetch collections:',
      await collectionsRes.text(),
    )
    return
  }

  const collections = await collectionsRes.json()

  // Check if "Sodium Analytics" already exists
  const existingCollection = collections.find(
    (col) => col.name === 'Sodium Analytics',
  )

  if (existingCollection) {
    console.log(
      `✅ Collection 'Sodium Analytics' already exists (ID: ${existingCollection.id}).`,
    )
    return existingCollection.id
  }

  console.log("🛠 Creating collection 'Sodium Analytics'...")

  // Create new collection
  const createRes = await fetch(`${METABASE_URL}/api/collection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': mbToken,
    },
    body: JSON.stringify({
      name: 'Sodium Analytics',
      parent_id: null, // Null means it's a root-level collection
    }),
  })

  if (createRes.ok) {
    const collectionData = await createRes.json()
    console.log(
      `✅ Collection 'Sodium Analytics' created (ID: ${collectionData.id}).`,
    )
    return collectionData.id
  } else {
    console.error('❌ Failed to create collection:', await createRes.text())
    return null
  }
}
