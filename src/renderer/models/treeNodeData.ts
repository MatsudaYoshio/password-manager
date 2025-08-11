import Credential, { CredentialPlain } from './credential';

interface TreeNodeData {
  title: string;
  credentials: Credential[];
}

// TreeNodeDataのプレーンオブジェクト型
export type TreeNodeDataPlain = {
  title: string;
  credentials: CredentialPlain[];
};

export default TreeNodeData;
