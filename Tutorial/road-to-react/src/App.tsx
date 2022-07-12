import { LastSearches } from "./LastSearches";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import axios from "axios";
import styled from "styled-components";
import { StoriesAction, StoriesState, Story } from "./type";
import { List } from "./List";
import { SearchForm } from "./SearchForm";
const API_BASE = "https://hn.algolia.com/api/v1";
const API_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";

const StyledContainer = styled.div`
  padding: 20px;
  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);
  color: #171212;
`;
const StyledHeadlinePrimary = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return { ...state, isLoading: true, isError: false };
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data:
          action.payload.page === 0
            ? action.payload.list
            : state.data.concat(action.payload.list),
        page: action.payload.page,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const useSemiPersistentState = (
  key: string,
  initialState: string
): [string, (value: string) => void] => {
  // If false, useEffect only runs once, if true, useEffect only runs on update
  const isMounted = useRef(false);
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);
  // First argument is the function that runs the side-effect.
  // Second Argument is a dependency array of variables
  // If any of the depended variables is changed, the function is ran
  // Leaving out the second argument would make the function
  // for the side effect run on every render (initial render and update renders) of the component.
  // The setting of items is deemed as a side effect
  // useEffect is a side-effect hook
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = !isMounted.current;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

const getSumComments = (stories: StoriesState) => {
  return stories.data.reduce((result, value) => result + value.num_comments, 0);
};

const getUrl = (searchTerm: string, page: number): string =>
  `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

const extractSearchTerm = (url: string): string =>
  url
    .substring(url.lastIndexOf("?") + 1, url.lastIndexOf("&"))
    .replace(PARAM_SEARCH, "");

const getLastSearches = (urls: Array<string>) =>
  urls.reduce((result: Array<string>, url, index) => {
    const searchTerm = extractSearchTerm(url);
    if (index === 0) {
      return result.concat(searchTerm);
    }
    const previousSearchTerm = result[result.length - 1];
    if (searchTerm === previousSearchTerm) {
      return result;
    } else {
      return result.concat(searchTerm);
    }
  }, []);

const App = () => {
  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    page: 0,
    isLoading: false,
    isError: false,
  });
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
  const [urls, setUrls] = useState<Array<string>>([getUrl(searchTerm, 0)]);

  // useCallback is one of Reacts memo hooks
  // useCallback only creates a memoized function every time its dependency array changes.
  // Only then will the useEffect hook run again because it depends on the new function
  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: "STORIES_FETCH_INIT", page: 0 });
    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);

      console.log(result);

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: { list: result.data.hits, page: result.data.page },
      });
    } catch (err) {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [urls]);

  useEffect(() => {
    handleFetchStories();
    // The Empty array will tell useEffect to only run once the component renders for the first time and it will not run again
  }, [handleFetchStories]);

  // Tells React not to re-render the function
  // Should only use if the function has a dependency on states within the component
  // In this case there is not, hence there is no use for the useCallback below
  const handleRemoveStory = useCallback((item: Story) => {
    dispatchStories({ type: "REMOVE_STORY", payload: item });
  }, []);

  const handleSearch = (searchTerm: string, page: number) => {
    const url = getUrl(searchTerm, page);
    setUrls(urls.concat(url));
  };

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    handleSearch(searchTerm, 0);
    event.preventDefault();
  };

  const handleLastSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm, 0);
  };

  const handleMore = () => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  };

  const lastSearches = getLastSearches(urls);

  const sumComments = getSumComments(stories);

  return (
    <StyledContainer>
      <StyledHeadlinePrimary>
        My Hacker Stories with {sumComments} comments
      </StyledHeadlinePrimary>
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
      <LastSearches
        lastSearches={lastSearches}
        onLastSearch={handleLastSearch}
      />
      {/*In JavaScript a true && "Hello World" always evaluates to "Hellow
      World" Whereas a false && "Hello World" always evaluates to false*/}

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}

      <button type="button" onClick={handleMore}>
        More
      </button>
    </StyledContainer>
  );
};

export default App;
export { storiesReducer };
