import React, {useState} from "react";
import {Button, Card, CardBody, CardHeader, Radio, RadioGroup} from "@heroui/react";
import {CardTitle} from "@/components/ui/card";
import {LucideBadgeCheck} from "lucide-react";

interface SurveyProps {
    title: string;
    description: string;
    options: string[];
    selectedOption: string;
    handleOptionChange: (option: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const MultipleChoiceSurvey: React.FC<SurveyProps> = ({
                                                         title,
                                                         description,
                                                         options,
                                                         selectedOption,
                                                         handleOptionChange,
                                                         handleSubmit,
                                                     }) => {
    const [internalSelectedOption, setInternalSelectedOption] = useState<string>(selectedOption);

    const handleInternalOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInternalSelectedOption(value);
        handleOptionChange(value);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center bg-blue-600 text-white py-4 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardBody className="p-6 bg-white">
                    <form onSubmit={handleSubmit}>
                        <RadioGroup
                            label={description}
                            value={internalSelectedOption}
                            onChange={handleInternalOptionChange}
                            className="text-center text-xl"
                        >
                            {options.map((option, index) => (
                                <Radio
                                    key={index}
                                    value={option}
                                >
                                    <span>{option}</span>
                                </Radio>
                            ))}
                        </RadioGroup>
                        <Button endContent={<LucideBadgeCheck/>} className="w-full mt-4 text-lg">
                            Abschicken
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    )
        ;
};

export default MultipleChoiceSurvey;
