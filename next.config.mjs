/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ["lh3.googleusercontent.com", "profile.line-scdn.net"] },
  async headers() {
    return [
      {
        // กำหนดให้ path ที่ขึ้นต้นด้วย /api/ ทั้งหมดใช้กฎนี้
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // อนุญาตให้เฉพาะบางโดเมนเรียกใช้
          { key: "Access-Control-Allow-Origin", value: "https://www.another-app.com, http://localhost:3001" },
          // หรืออนุญาตให้ทุกโดเมน (ต้องระวังเรื่องความปลอดภัย)
          // { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
