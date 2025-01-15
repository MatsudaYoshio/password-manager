import { useDispatch } from "react-redux";
import { itemActions } from "../store/item-slice";

const useAddNewTopItem = () => {
  const dispatch = useDispatch();
  return () => dispatch(itemActions.addNewTopItem());
};

export default useAddNewTopItem;
