import {GeneratedFile} from "@/components/FileTree";


export interface TreeNode {
    [key: string]: TreeNode | GeneratedFile
}

export interface RenderTreeProps {
    node: TreeNode
    path?: string
    onSelect: (file: GeneratedFile) => void
    selectedFile: GeneratedFile | null
}