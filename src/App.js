import './App.css';
import Admin from "./components/Admin";
import 'antd/dist/antd.css';
import {BrowserRouter} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Admin />
    </BrowserRouter>
  );
}

export default App;
