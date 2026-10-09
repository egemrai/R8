"use client";

import { useRef, useState } from "react";

const W = 800;
const H = 1000;

type Point = [number, number];

function getGeometry() {
    /*
      800 genişlik:
      
      3x + 2x = 800
      x = 160
  
      3x = 480
      2x = 320
    */

    const x = W / 5;

    const x2 = 2 * x; // 320
    const x3 = 3 * x; // 480
    const x5 = 5 * x; // 800

    return {
        // Foto 1
        p1: [
            [0, 0],
            [x3, 0],
            [0, H * 0.6],
        ] as Point[],

        // Foto 2
        p2: [
            [x3, 0],
            [W, 0],
            [0, H],
            [0, H * 0.6],
        ] as Point[],

        // Foto 3
        p3: [
            [W, 0],
            [W, H * 0.3],
            [x2, H],
            [0, H],
            [0, H],
        ] as Point[],

        // Foto 4
        p4: [
            [W, H * 0.3],
            [W, H],
            [x2, H],
        ] as Point[],
    };
}

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;

        img.src = URL.createObjectURL(file);
    });
}

function drawPolygon(
    ctx: CanvasRenderingContext2D,
    points: Point[]
) {
    ctx.beginPath();

    points.forEach(([x, y], index) => {
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.closePath();
}

function drawImageCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement
) {
    /*
      Fotoğrafı canvasın tamamını kaplayacak şekilde
      scale ediyoruz.
  
      Böylece kaynak fotoğraf 4:5 ise
      oranı bozulmadan crop edilmiş oluyor.
    */

    const scale = Math.max(
        W / img.width,
        H / img.height
    );

    const width = img.width * scale;
    const height = img.height * scale;

    const x = (W - width) / 2;
    const y = (H - height) / 2;

    ctx.drawImage(
        img,
        x,
        y,
        width,
        height
    );
}

export default function ImageComposer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [files, setFiles] = useState<File[]>([]);

    const generate = async () => {
        if (files.length !== 4) {
            alert("Tam olarak 4 fotoğraf seç.");
            return;
        }

        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        canvas.width = W;
        canvas.height = H;

        const images = await Promise.all(
            files.map(loadImage)
        );

        const geometry = getGeometry();

        const polygons = [
            geometry.p1,
            geometry.p2,
            geometry.p3,
            geometry.p4,
        ];

        /*
          Her fotoğrafı kendi polygonunun içine çiz.
        */

        images.forEach((img, index) => {
            ctx.save();

            drawPolygon(
                ctx,
                polygons[index]
            );

            ctx.clip();

            drawImageCover(ctx, img);

            ctx.restore();
        });

        /*
          İstersen kesişim çizgilerini buradan çiziyoruz.
        */

        ctx.save();

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 8;
        ctx.lineJoin = "miter";

        polygons.forEach((polygon) => {
            drawPolygon(ctx, polygon);
            ctx.stroke();
        });

        ctx.restore();
    };

    const download = () => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const link = document.createElement("a");

        link.download = "composition.png";
        link.href = canvas.toDataURL("image/png");

        link.click();
    };

    return (
        <main
            style={{
                padding: 40,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                alignItems: "flex-start",
            }}
        >
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                    const selected = Array.from(
                        e.target.files ?? []
                    );

                    if (selected.length === 4) {
                        setFiles(selected);
                    }
                }}
            />

            <button
                onClick={generate}
                disabled={files.length !== 4}
            >
                Birleştir
            </button>

            <button onClick={download}>
                PNG indir
            </button>

            <canvas
                ref={canvasRef}
                style={{
                    width: 400,
                    height: 500,
                    border: "1px solid #ccc",
                }}
            />
        </main>
    );
}