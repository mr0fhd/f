document.addEventListener("DOMContentLoaded", () => {
  // Function to create and show a full-screen gift animation
  function showGiftAnimation(giftType) {
    const animationContainer = document.createElement("div")
    animationContainer.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-1000"
    animationContainer.style.opacity = "0" // Start hidden for fade-in

    const giftContent = document.createElement("div")
    giftContent.className = "relative flex flex-col items-center"

    const giftImage = document.createElement("img")
    giftImage.src = `/placeholder.svg?height=200&width=200&query=${giftType} large gift animation`
    giftImage.alt = giftType
    giftImage.width = 200
    giftImage.height = 200
    giftImage.className = "animate-bounce-once" // Assuming Tailwind animation is available

    const giftText = document.createElement("span")
    giftText.className = "mt-4 text-4xl font-bold text-white drop-shadow-lg"
    giftText.textContent = giftType

    giftContent.appendChild(giftImage)
    giftContent.appendChild(giftText)
    animationContainer.appendChild(giftContent)
    document.body.appendChild(animationContainer)

    // Fade in
    setTimeout(() => {
      animationContainer.style.opacity = "1"
    }, 10) // Small delay to ensure transition applies

    // Fade out after 2 seconds
    setTimeout(() => {
      animationContainer.style.opacity = "0"
    }, 2000)

    // Remove component after fade out transition (e.g., 1 second transition)
    setTimeout(() => {
      animationContainer.remove()
    }, 3000)
  }

  // Function to create and show a full-screen like animation
  function showLikeAnimation() {
    const animationContainer = document.createElement("div")
    animationContainer.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-500"
    animationContainer.style.opacity = "0" // Start hidden for fade-in

    const likeContent = document.createElement("div")
    likeContent.className = "relative flex flex-col items-center"

    // Using a simple div for the heart icon, you might replace this with an SVG or Font Awesome icon if available
    const heartIcon = document.createElement("div")
    heartIcon.className = "h-48 w-48 text-red-500 animate-bounce-once flex items-center justify-center"
    heartIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>` // Lucide Heart SVG

    const likeText = document.createElement("span")
    likeText.className = "mt-4 text-4xl font-bold text-white drop-shadow-lg"
    likeText.textContent = "أعجبني!"

    likeContent.appendChild(heartIcon)
    likeContent.appendChild(likeText)
    animationContainer.appendChild(likeContent)
    document.body.appendChild(animationContainer)

    // Fade in
    setTimeout(() => {
      animationContainer.style.opacity = "1"
    }, 10)

    // Fade out after 1.5 seconds
    setTimeout(() => {
      animationContainer.style.opacity = "0"
    }, 1500)

    // Remove component after fade out transition (e.g., 0.5 second transition)
    setTimeout(() => {
      animationContainer.remove()
    }, 2000)
  }

  // Function to add event listeners to a single message's buttons
  function addListenersToMessageButtons(messageElement) {
    const likeButton = messageElement.querySelector(".like-button")
    const giftButton = messageElement.querySelector(".gift-button")

    if (likeButton) {
      likeButton.addEventListener("click", function () {
        let currentLikes = Number.parseInt(this.getAttribute("data-likes"))
        currentLikes++
        this.setAttribute("data-likes", currentLikes)
        this.querySelector(".likes-count").textContent = currentLikes
        showLikeAnimation() // Trigger full-screen like animation
        console.log(`Message ${this.dataset.messageId} liked! Total likes: ${currentLikes}`)
      })
    }

    if (giftButton) {
      giftButton.addEventListener("click", function () {
        // For simplicity, we'll just show a generic gift animation.
        // In a real scenario, you'd need a gift picker UI here.
        const giftType = "Classic Donut" // Default gift type for demonstration
        showGiftAnimation(giftType) // Trigger full-screen gift animation
        console.log(`Gift button clicked for message ${this.dataset.messageId}. Sent: ${giftType}`)
        alert("تم إرسال هدية!") // Keep the original alert for now
      })
    }
  }

  // Select all existing public messages and add button listeners
  const publicMessages = document.querySelectorAll(".public_message")
  publicMessages.forEach(addListenersToMessageButtons)

  // Observe for dynamically added messages (e.g., new chat messages)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList.contains("public_message")) {
            addListenersToMessageButtons(node)
          }
        })
      }
    })
  })

  const chatBodyMessagesContainer = document.getElementById("chat__body__messages_container")
  if (chatBodyMessagesContainer) {
    observer.observe(chatBodyMessagesContainer, { childList: true, subtree: true })
  }
})
