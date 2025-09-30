import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Dot, User } from "lucide-react";
import dayjs from "dayjs";

const socket = io(import.meta.env.VITE_URL_IO); // เชื่อมหลังบ้าน

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [username, setUsername] = useState(""); // ชื่อที่ยืนยันแล้ว
  const [tempName, setTempName] = useState(""); // ชื่อที่พิมพ์อยู่ใน input
  const [online, setOnline] = useState(0); //นับจำนวนคนออน

  useEffect(() => {
    socket.on("online_users", (count) => {
      setOnline(count);
    });

    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && username.trim()) {
      const now = dayjs().format("mm:ss"); // เวลาตอนนี้
      socket.emit("send_message", { user: username, text: message, time: now });
      setMessage("");
    }
  };

  const confirmUsername = () => {
    if (tempName.trim()) {
      setUsername(tempName); // ยืนยันชื่อ
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      <header className="bg-blue-500 text-white text-center p-4 text-xl font-bold">
        💬 แชท REACT + EXPRESS + SOCKET.IO
        <div className="flex items-center justify-center">ออนไลน์ {online}</div>
      </header>
      {!username ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="bg-white shadow-md rounded-lg p-2 w-80">
            <header className="bg-blue-500 text-white rounded-lg text-center p-4 text-xl font-bold">
              กรอกชื่อ
            </header>
            <div className="my-5">
              <input
                type="text"
                placeholder="ใส่ชื่อก่อนเข้าแชท..."
                maxLength={20}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-500 text-gray-700"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
            </div>
            <button onClick={confirmUsername} className="w-full">
              ยืนยัน
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* กล่องข้อความ */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chat.map((msg, i) => {
              const isMine = msg.user === username;
              return (
                <div
                  key={i}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                      isMine
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm font-semibold flex">
                      <User size={20} fill={isMine ? "white" : "gray-800"} />
                      {msg.user}
                      <span className="ml-2">{msg.time}</span>
                    </p>

                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* กล่องพิมพ์ข้อความ */}
          <div className="flex items-center border-t p-3 bg-white">
            <input
              type="text"
              value={message}
              placeholder="พิมพ์ข้อความ..."
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border rounded-full px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
            >
              ส่ง
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
