import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import "./App.css";
import { Routers } from "./routers";
import { MathJaxContext } from "better-react-mathjax";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./UI/topscroll";

function App() {
  const mathJaxConfig = {
    loader: { load: ["input/tex", "output/svg", "[tex]/html"] },
    tex: {
      packages: { "[+]": ["html"] },
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
      processEscapes: true,
    },
  };
  return (
    <Provider store={store}>
      <BrowserRouter>
        <MathJaxContext config={mathJaxConfig} version={2}>
          <ScrollToTop />
          <Routers />
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover={false}
            theme="light" // or "dark"
          />
        </MathJaxContext>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
