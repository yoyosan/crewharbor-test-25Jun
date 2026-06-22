import { ref } from 'vue'

const isLive = ref(true)

export function useLiveState() {
  const toggleLive = () => {
    isLive.value = !isLive.value
  }

  return { isLive, toggleLive }
}
