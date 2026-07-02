import { Container } from "@/components/egem-ui/Container"
import { Post } from "@/components/post/post"
import Image from "next/image"

export default function Home() {
  return (

    <Container className={'grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6'}> {/*ekran büyük olursa 2-1 grid, küçülürse 1 grid*/}


      <div className=" p-4">
        <Post />
      </div>
      <div className="bg-primary-400 text-white p-4 hidden lg:block"> {/*ekran büyük olursa mesajlar block, küçük olursa hidden*/}
        messages
      </div>

    </Container >
  )
}

// tailwind.config.ts