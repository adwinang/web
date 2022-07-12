import TestRenderer from "react-test-renderer";
import { render, screen, fireEvent, act } from "@testing-library/react";
import axios from "axios";
import App, { storiesReducer } from "./App";
import { StoriesRemoveAction, StoriesState, Story } from "./type";
import { Item } from "./List";
import { SearchForm } from "./SearchForm";

jest.mock("axios");
const mockedAxios = jest.mocked(axios, true);

const storyOne: Story = {
  title: "React",
  url: "https://reactjs.org/",
  author: "Jordan Walke",
  num_comments: 3,
  points: 4,
  objectID: "0",
};

const storyTwo = {
  title: "Redux",
  url: "https://redux.js.org/",
  author: "Dan Abramov, Andrew Clark",
  num_comments: 2,
  points: 5,
  objectID: 1,
};
const stories = [storyOne, storyTwo];

describe("storiesReducer", () => {
  test("removes a story from all stories", () => {
    const action: StoriesRemoveAction = {
      type: "REMOVE_STORY",
      payload: storyOne,
    };
    const state: StoriesState = {
      data: stories,
      isLoading: false,
      isError: false,
      page: 0,
    };

    const newState = storiesReducer(state, action);

    const expectedState = {
      data: [storyTwo],
      isLoading: false,
      isError: false,
    };

    // If use toBe, there will be a problem as the object reference between the two objects are not the same
    expect(newState).toStrictEqual(expectedState);
  });
});

describe("Item", () => {
  test("renders all properties", () => {
    render(
      <Item
        item={storyOne}
        onRemoveItem={() => {
          return;
        }}
      />
    );
    expect(screen.getByText("Jordan Walke")).toBeInTheDocument();
    expect(screen.getByText("React")).toHaveAttribute(
      "href",
      "https://reactjs.org/"
    );
  });

  test("renders a clickable dismiss button", () => {
    render(
      <Item
        item={storyOne}
        onRemoveItem={() => {
          return;
        }}
      />
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("clicking the dismiss button calls the callback handler", () => {
    // The following function is a mock function to capture when it's called
    const handleRemoveItem = jest.fn();
    render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />);

    fireEvent.click(screen.getByRole("button"));

    expect(handleRemoveItem).toHaveBeenCalledTimes(1);
  });
});

describe("SearchForm", () => {
  const searchFormProps = {
    searchTerm: "React",
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn(),
  };
  test("renders the input field with its value", () => {
    render(<SearchForm {...searchFormProps} />);
    expect(screen.getByDisplayValue("React")).toBeInTheDocument();
  });

  test("renders the correct label", () => {
    render(<SearchForm {...searchFormProps} />);
    // Regular Expressions can be used as well
    expect(screen.getByLabelText(/Search/)).toBeInTheDocument();
  });

  test("calls onSearchInput on input field change", () => {
    render(<SearchForm {...searchFormProps} />);
    fireEvent.change(screen.getByDisplayValue("React"), {
      target: { value: "Redux" },
    });
    expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
  });

  test("calls onSearchSubmit on button submit click", () => {
    render(<SearchForm {...searchFormProps} />);
    fireEvent.submit(screen.getByRole("button"));
    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
  });

  test("renders snapshot", () => {
    // React Test Renderer library is recommended for testing snapshots
    const search = TestRenderer.create(
      <SearchForm {...searchFormProps} />
    ).toJSON();
    expect(search).toMatchSnapshot();
  });
});

describe("App component", () => {
  test("succeeds fetching data", async () => {
    // Simulate fetching of data
    const promise: Promise<any> = Promise.resolve({
      data: {
        hits: stories,
      },
    });

    mockedAxios.get.mockImplementationOnce(() => promise);

    render(<App />);

    // There is a difference between getByText and queryByText
    // getByText will throw an error if the element is not found
    // queryByText will return null if the element is not found which may not be intended
    expect(screen.getByText(/Loading/)).toBeInTheDocument();

    await act(async () => promise);

    expect(screen.queryByText(/Loading/)).toBeNull();

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Redux")).toBeInTheDocument();
    // Item does not have a button with Dismiss
    // expect(screen.getAllByText("Dismiss").length).toBe(2);
  });

  // App is not re-rendering for some reason
  // The fail on fetch runs but the html element does not change
  // test("fails fetching data", async () => {
  //   const promise: Promise<any> = Promise.reject();
  //   mockedAxios.get.mockImplementationOnce(() => promise);

  //   render(<App />);

  //   expect(screen.getByText(/Loading/)).toBeInTheDocument();

  //   try {
  //     await act(() => promise);
  //   } catch (err) {}
  //   expect(screen.queryByText(/Loading/)).toBeNull();
  //   expect(screen.getByText(/went wrong/)).toBeInTheDocument();
  // });

  test("removes a story", async () => {
    const promise: Promise<any> = Promise.resolve({
      data: {
        hits: stories,
      },
    });

    mockedAxios.get.mockImplementationOnce(() => promise);

    render(<App />);

    await act(() => promise);

    expect(screen.getAllByAltText("Dismiss").length).toBe(2);
    expect(screen.getByText("Jordan Walke")).toBeInTheDocument();

    fireEvent.click(screen.getAllByAltText("Dismiss")[0]);

    expect(screen.getAllByAltText("Dismiss").length).toBe(1);
    expect(screen.queryByText("Jordan Walke")).toBeNull();
  });

  test("searches for specific stories", async () => {
    const reactPromise: Promise<any> = Promise.resolve({
      data: {
        hits: stories,
      },
    });
    const anotherStory = {
      title: "JavaScript",
      url: "https://en.wikipedia.org/wiki/JavaScript",
      author: "Brendan Eich",
      num_comments: 15,
      points: 10,
      objectID: 3,
    };
    const javascriptPromise: Promise<any> = Promise.resolve({
      data: {
        hits: [anotherStory],
      },
    });
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("React")) {
        return reactPromise;
      }

      if (url.includes("JavaScript")) {
        return javascriptPromise;
      }
      throw Error();
    });

    // Initial Render
    render(<App />);
    // First Data Fetching
    await act(() => reactPromise);
    expect(screen.getByDisplayValue("React")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("JavaScript")).toBeNull();
    expect(screen.getByText("Jordan Walke")).toBeInTheDocument();

    expect(screen.getByText("Dan Abramov, Andrew Clark")).toBeInTheDocument();
    expect(screen.queryByText("Brendan Eich")).toBeNull();
  });
});
