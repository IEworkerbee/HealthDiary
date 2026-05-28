import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    const getDummy = async () => {
      const response = await fetch("/api/store_user_log");
      const data = await response.json();
      setData(data.message);
    };
    getDummy();
  }, []);
  return <div>data = {data}</div>;
}

export default App;
