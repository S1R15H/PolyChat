import { LoaderIcon } from "lucide-react"
import { useThemeStore } from "../store/useThemeStore.js"

const PageLoader = () => {
  const {theme} = useThemeStore();
  return (
    <div className="min-h-screen flex items-center justify-center" data-theme={theme}>
        <LoaderIcon className="animate-spin size-10 text-opacity-0" />
    </div>
  )
}

export default PageLoader