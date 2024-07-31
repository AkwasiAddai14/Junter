declare module 'react-rating-stars-component' {
    import { Component } from 'react';
  
    interface ReactStarsProps {
      count?: number;
      value?: number;
      onChange?: (newRating: number) => void;
      size?: number;
      isHalf?: boolean;
      emptyIcon?: React.ReactElement;
      halfIcon?: React.ReactElement;
      fullIcon?: React.ReactElement;
      filledIcon?: React.ReactElement;
      color?: string;
      activeColor?: string;
      edit?: boolean;
    }
  
    class ReactStars extends Component<ReactStarsProps> {}
  
    export default ReactStars;
  }
  