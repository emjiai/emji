declare module 'react-d3-tree' {
  export interface LinkDatum {
    source: {
      x: number;
      y: number;
      data?: any;
      depth?: number;
      [key: string]: any;
    };
    target: {
      x: number;
      y: number;
      data?: any;
      depth?: number;
      [key: string]: any;
    };
  }

  export interface TreeProps {
    data: any;
    orientation?: 'vertical' | 'horizontal';
    translate?: { x: number; y: number };
    pathFunc?: (linkData: LinkDatum) => string;
    renderCustomNodeElement?: (props: any) => React.ReactElement;
    separation?: { siblings: number; nonSiblings: number };
    zoom?: number;
    initialDepth?: number;
    enableLegacyTransitions?: boolean;
    nodeSize?: { x: number; y: number };
    pathClassFunc?: () => string;
    scaleExtent?: { min: number; max: number };
    collapsible?: boolean;
    transitionDuration?: number;
    zoomable?: boolean;
    draggable?: boolean;
    svgProps?: React.SVGProps<SVGSVGElement>;
    onUpdate?: (detail: any) => void;
    rootNodeClassName?: string;
    branchNodeClassName?: string;
    leafNodeClassName?: string;
  }

  const Tree: React.FC<TreeProps>;
  export default Tree;
}
