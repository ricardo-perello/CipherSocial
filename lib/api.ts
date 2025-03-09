const API_BASE_URL = "http://localhost:5000"

/**
 * Create a new meetup
 * @param data The meetup data to send to the server
 * @returns The response from the server
 */
export async function createMeetup(data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/create-meetup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create meetup")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating meetup:", error)
    throw error
  }
}

/**
 * Post root data when a user joins a meet
 * @param data The root data to send to the server
 * @returns The response from the server
 */
export async function postRoot(data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/post-root`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to post root data")
    }

    return await response.json()
  } catch (error) {
    console.error("Error posting root data:", error)
    throw error
  }
}

/**
 * Send hashed interests to the server
 * @param data The hashed interests data
 * @returns The response from the server
 */
export async function sendHashedInterests(data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/receive-hashed-interests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to send hashed interests")
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending hashed interests:", error)
    throw error
  }
}

