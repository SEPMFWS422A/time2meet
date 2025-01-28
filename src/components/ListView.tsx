import {Card, CardBody, Tab, Tabs} from "@heroui/react";
import {LucidePersonStanding, LucideUsers} from "lucide-react";
import {useState} from "react";
import Grouplist from "@/components/Grouplist";
import Friendlist from "@/components/Friendlist";

function ListView() {

    const [selected, setSelected] = useState("groups");

    return (
        <div className="border-2 rounded-lg">
            <Tabs aria-label="Options" placement="top" color="primary" variant="light" selectedKey={selected}
                  onSelectionChange={(key) => setSelected(key as string)}>
                <Tab
                    key="groups"
                    title={
                        <div className="flex items-center space-x-2">
                            <LucideUsers/>
                            <span>Gruppen</span>
                        </div>
                    }
                >
                    <Card>
                        <CardBody>
                            <Grouplist></Grouplist>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab
                    key="friends"
                    title={
                        <div className="flex items-center space-x-2">
                            <LucidePersonStanding/>
                            <span>Freunde</span>
                        </div>
                    }
                >
                    <Card>
                        <CardBody>
                            <Friendlist></Friendlist>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>


    );
}

export default ListView;