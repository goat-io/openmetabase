async function getOrCreateQuestion({
  mbToken,
  collectionId,
  databaseId,
}: {
  mbToken: string
  collectionId: string
  databaseId: string
}) {
  console.log("🔍 Checking if question '# Comments' exists...")

  // Fetch existing questions in the collection
  const questionsRes = await fetch(`${METABASE_URL}/api/card`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': mbToken,
    },
  })

  if (!questionsRes.ok) {
    console.error('❌ Failed to fetch questions:', await questionsRes.text())
    return
  }

  const questions = await questionsRes.json()

  // Check if "# Comments" question already exists in the collection
  const existingQuestion = questions.find(
    (q) => q.name === '# Comments' && q.collection_id === collectionId,
  )

  if (existingQuestion) {
    console.log(
      `✅ Question '# Comments' already exists (ID: ${existingQuestion.id}).`,
    )
    return existingQuestion.id
  }

  console.log("🛠 Creating question '# Comments'...")

  // Create new question
  const createRes = await fetch(`${METABASE_URL}/api/card`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': mbToken,
    },
    body: JSON.stringify({
      name: '# Comments',
      dataset_query: {
        type: 'native',
        native: {
          query: 'SELECT COUNT(*) AS `count` FROM `activities`',
        },
        database: databaseId, // This should match your MySQL database ID in Metabase
      },
      display: 'scalar', // "scalar" visualization for a single number
      visualization_settings: {},
      collection_id: collectionId,
    }),
  })

  if (createRes.ok) {
    const questionData = await createRes.json()
    console.log(`✅ Question '# Comments' created (ID: ${questionData.id}).`)
    return questionData.id
  } else {
    console.error('❌ Failed to create question:', await createRes.text())
    return null
  }
}
