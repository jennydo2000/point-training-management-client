import {cloneElement, useLayoutEffect, useRef, useState} from "react";
import {Table} from "antd";

function FullHeightTable(props) {
    const ref = useRef();
    const [height, setHeight] = useState(0);

    useLayoutEffect(() => {
        const node = ref.current;
        setHeight(node?.clientHeight - 55);
    }, [ref]);

    return (
        <div ref={ref} style={{width: "100%", flexGrow: 1}}>
            <Table scroll={{x: props.width, y: height}} {...props}/>
        </div>
    );
}

export default FullHeightTable;

FullHeightTable.defaultProps = {
    width: "100%",
}