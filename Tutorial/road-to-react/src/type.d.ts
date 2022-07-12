type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
};

type Story = {
  objectID: number | string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type Stories = Array<Story>;

type StoriesState = {
  data: Stories;
  page: number;
  isLoading: boolean;
  isError: boolean;
};

interface StoriesFetchInitAction {
  type: "STORIES_FETCH_INIT";
  page: number;
}

interface StoriesFetchSuccessAction {
  type: "STORIES_FETCH_SUCCESS";
  payload: {
    list: Stories;
    page: number;
  };
}
interface StoriesFetchFailureAction {
  type: "STORIES_FETCH_FAILURE";
}
interface StoriesRemoveAction {
  type: "REMOVE_STORY";
  payload: Story;
}
type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children: React.ReactNode;
};
type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

export {
  Story,
  Stories,
  StoriesState,
  StoriesAction,
  StoriesFetchInitAction,
  StoriesFetchSuccessAction,
  StoriesFetchFailureAction,
  StoriesRemoveAction,
  ListProps,
  InputWithLabelProps,
  SearchFormProps,
};
