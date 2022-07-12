import { memo, useId, useState } from "react";
import { ListProps, Stories, Story } from "./type";
import styles from "./App.module.css";
import { ReactComponent as Check } from "./check.svg";
import { sortBy } from "lodash";

interface ISort {
  NONE(list: Stories): Stories;
  TITLE(list: Stories): Stories;
  AUTHOR(list: Stories): Stories;
  COMMENT(list: Stories): Stories;
  POINT(list: Stories): Stories;
}

type SortType = keyof ISort;

const SORTS: ISort = {
  NONE: (list: Stories): Stories => list,
  TITLE: (list: Stories): Stories => sortBy(list, "title"),
  AUTHOR: (list: Stories): Stories => sortBy(list, "author"),
  COMMENT: (list: Stories): Stories => sortBy(list, "num_comments").reverse(),
  POINT: (list: Stories): Stories => sortBy(list, "points").reverse(),
};

const Item = ({
  item,
  onRemoveItem,
}: {
  item: Story;
  onRemoveItem: (item: Story) => void;
}) => {
  // Components only accept one input
  return (
    <li className={styles.item}>
      <span style={{ width: "40%" }}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={{ width: "30%" }}> {item.author} </span>
      <span style={{ width: "10%" }}>{item.num_comments} </span>
      <span style={{ width: "10%" }}>{item.points} </span>
      <span style={{ width: "10%" }}>
        {/* 
        Alternative implementation for onClick  
        onClick={onRemoveItem.bind(null, item)}
        Though I would not recommend it as it would require everyone to under "this" scoping
        Current implementation have a caveat which is that we should avoid any complex logic in the arrow function
        As the JavaScript logic may be hidden in JSX
        */}
        <button
          type="button"
          onClick={() => onRemoveItem(item)}
          className={`${styles.button} ${styles.button_small}`}
        >
          <Check style={{ height: "18px", width: "18px" }} />
        </button>
      </span>
    </li>
  );
};

const List = memo(({ list, onRemoveItem }: ListProps) => {
  const id = useId();
  const [sort, setSort] = useState<{ sortKey: SortType; isReverse: Boolean }>({
    sortKey: "NONE" as SortType,
    isReverse: false,
  });

  const handleSort = (sortKey: SortType) => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    setSort({ sortKey, isReverse });
  };

  const sortFunction = SORTS[sort.sortKey];
  const sortedList = sort.isReverse
    ? sortFunction(list).reverse()
    : sortFunction(list);

  return (
    <ul>
      <li className={styles.item}>
        <span style={{ width: "40%" }}>
          <button type="button" onClick={() => handleSort("TITLE" as SortType)}>
            <b>Title</b>
          </button>
        </span>
        <span style={{ width: "30%" }}>
          <button
            type="button"
            onClick={() => handleSort("AUTHOR" as SortType)}
          >
            <b>Author</b>
          </button>
        </span>
        <span style={{ width: "10%" }}>
          <button
            type="button"
            onClick={() => handleSort("COMMENT" as SortType)}
          >
            <b>Comments</b>
          </button>
        </span>
        <span style={{ width: "10%" }}>
          <button type="button" onClick={() => handleSort("POINT" as SortType)}>
            <b>Points</b>
          </button>
        </span>
        <span style={{ width: "10%" }}>
          <b>Actions</b>
        </span>
      </li>
      {sortedList.map((item) => {
        return (
          <Item
            key={`${id}-${item.objectID}`}
            onRemoveItem={onRemoveItem}
            item={item}
          />
        );
      })}
    </ul>
  );
});

export { List, Item };
