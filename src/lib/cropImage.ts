export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: any
) {
    const image = new Image()

    image.src = imageSrc
    // image.onload = resolve'un açılımı alttaki kod bloğu. üstteki image.src = imageSrc resmi yükleyen ve vakit alan fonksiyon sanırım; ama async değil o yüzden image.src = imageSrc'dan sonra altında yüklendiğini kontrol eden promise var.
    /* image.onload = () => {
        resolve(undefined) */
    await new Promise((resolve) => {
        image.onload = resolve
    })

    //image.onload = resolve yerine addEventListener ile de yapılabilir. 
    /*
    await new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true })
    })
    */



    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob!)
        }, "image/png")
    })
}