import {ReactElement} from "react";

type HeadingProps = { title: string }

const Heading = ({title}: HeadingProps): ReactElement => {
    return (
        // add inline css to h1: bottom margin
        <h1 style={{margin: '0.3em 0em 0.5em 0em'}}>{title}</h1>

    )
}
export default Heading