import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import { alpha, styled } from "@mui/material/styles";
import TreeView from "@mui/lab/TreeView";
import TreeItem, { TreeItemProps, treeItemClasses } from "@mui/lab/TreeItem";
import Collapse from "@mui/material/Collapse";
import { useSpring, animated } from "@react-spring/web";
import { TransitionProps } from "@mui/material/transitions";
import { useDispatch, useSelector } from "react-redux";

// import { TreeNode, TreeNodeData } from "../../interfaces/tree-node";
import TreeNode from "../../models/treeNode";
import TreeNodeData from "../../models/treeNodeData";
import { itemActions } from "../../store/item-slice";

function MinusSquare(props: SvgIconProps) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props: SvgIconProps) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare(props: SvgIconProps) {
  return (
    <SvgIcon className="close" fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    from: {
      opacity: 0,
      transform: "translate3d(20px,0,0)",
    },
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
    },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

const StyledTreeItem = styled((props: TreeItemProps) => <TreeItem {...props} TransitionComponent={TransitionComponent} />)(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

export default function ItemTreeView() {
  const dispatch = useDispatch();

  const item = useSelector((state: { item: { itemData: { main: TreeNode[]; staging: TreeNode[] } } }) => state.item.itemData.staging);
  // 木構造を扱う　https://qiita.com/horiuchie/items/f47528422acf0d84a70e

  const switchActiveNodeIdHandler = (id: string) => {
    dispatch(itemActions.switchActiveNodeById(id));
  };

  const getTreeItemsFromData = (treeItems: TreeNode[]) => {
    return treeItems.map((treeItemData) => {
      let children;
      if (treeItemData.children && treeItemData.children.length > 0) {
        children = getTreeItemsFromData(treeItemData.children);
      }
      return <StyledTreeItem onClick={() => switchActiveNodeIdHandler(treeItemData.id)} key={treeItemData.id} nodeId={treeItemData.id} label={treeItemData.data.title} children={children} />;
    });
  };

  // 指定されたIDのchildrenにノードを追加する関数
  // 途中で見つかったら打ち切る処理入れればもっと早い c
  const addNodeById = (nodes: TreeNode[], targetId: string, newNode: TreeNode): void => {
    for (const node of nodes) {
      if (node.id === targetId) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push(newNode);
        return;
      }

      if (node.children) {
        addNodeById(node.children, targetId, newNode);
      }
    }
  };

  // 指定されたIDのchildrenに新しいノードを追加
  // addNodeById(sampleData, "3_June", newMonthNode);

  // console.log(sampleData);

  // 指定されたIDの要素と配下要素も含めて削除する関数
  const removeNodeById = (nodes: TreeNode[], targetId: string): void => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.id === targetId) {
        nodes.splice(i, 1);
        return;
      }

      if (node.children) {
        removeNodeById(node.children, targetId);
      }
    }
  };

  // removeNodeById(sampleData, "3_June");

  // console.log(sampleData);

  const editNodeById = (nodes: TreeNode[], targetId: string, newData: Partial<TreeNodeData>): void => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.id === targetId) {
        nodes[i].data = { ...node.data, ...newData }; // 新しいデータで更新
        return;
      }

      if (node.children) {
        editNodeById(node.children, targetId, newData);
      }
    }
  };

  // editNodeById(sampleData, "1_Fall", { title: "UpdatedMonth" });

  // console.log(sampleData);

  return (
    <TreeView
      aria-label="customized"
      defaultExpanded={["1"]}
      defaultCollapseIcon={<MinusSquare />}
      defaultExpandIcon={<PlusSquare />}
      defaultEndIcon={<CloseSquare />}
      sx={{ height: 264, flexGrow: 1, maxWidth: 400, overflowY: "auto", mt: 1 }}
    >
      {
        getTreeItemsFromData(item)

        /* <StyledTreeItem nodeId="1" label="Main">
        <StyledTreeItem nodeId="2" label="Hello" />
        <StyledTreeItem nodeId="3" label="Subtree with children">
          <StyledTreeItem nodeId="6" label="Hello" />
          <StyledTreeItem nodeId="7" label="Sub-subtree with children">
            <StyledTreeItem nodeId="9" label="Child 1" />
            <StyledTreeItem nodeId="10" label="Child 2" />
            <StyledTreeItem nodeId="11" label="Child 3" />
          </StyledTreeItem>
          <StyledTreeItem nodeId="8" label="Hello" />
        </StyledTreeItem>
        <StyledTreeItem nodeId="4" label="World" />
        <StyledTreeItem nodeId="5" label="Something something" />
      </StyledTreeItem> */
      }
    </TreeView>
  );
}
