import { Post } from "@/components/post/post"
import Image from "next/image"

export default function Home() {
  return (
    <>
      <div className=" p-4">
        <Post />
      </div>
      <div className="bg-primary-400 text-white p-4 hidden lg:block"> {/*ekran büyük olursa mesajlar block, küçük olursa hidden*/}
        messages
      </div>
    </>
  )
}

// tailwind.config.ts