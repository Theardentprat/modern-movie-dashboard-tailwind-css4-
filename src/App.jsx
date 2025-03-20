import {useEffect,useState} from "react";
import Search from './components/Search.jsx';
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import search from "./components/Search.jsx";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";



const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY =import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {

    const [SearchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [trendingMovies   , setTrendingMovies   ] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    //Debounce the searchterm to prevent making too many API requests
    //by waiting for the user to stop typing for 500ms
    useDebounce(() => setDebouncedSearchTerm(SearchTerm), 500,[SearchTerm])

    const fetchMovies = async (query='') => {
        setIsLoading(true);
        setErrorMessage('');
        try{
            const endpoint=query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :  `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response=await fetch(endpoint,API_OPTIONS);
            if(!response.ok){
                throw new Error('Failed to fetch movies');
            }
            const data = await response.json();
            if(data.Response===false){
                setErrorMessage(data.error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }
            setMovieList(data.results || []);
            if(query && data.results.length>0){
                await updateSearchCount(query,data.results[0]);
            }
        }catch(error){
            console.log(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies.Please Try Again Later!');
        }finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies=async()=>{
        try{
              const movies= await getTrendingMovies();
              setTrendingMovies(movies);
        }catch(error){
            console.error(`Error fetching trending movies: ${error}`);

        }
    }

    useEffect(() => {
        console.log("API Key:", API_KEY);
        fetchMovies(SearchTerm);
    }, [SearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    },[])
    return (
        <main>
            <div className="Pattern"/>


            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner" />
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
                    <Search searchTerm={SearchTerm} setSearchTerm={setSearchTerm} />
                </header>
                <section className="all-movies">
                    <h2 className="mt-[40px]">All Movies</h2>

                    {isLoading ? (
                        <Spinner />
                    ):errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ):(
                        <ul className="movies-list">
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )}

                </section>
                <h1>All Movies</h1>
            </div>
        </main>

    )
}
export default App;