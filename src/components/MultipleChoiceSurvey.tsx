import {useState} from "react";
import '@/components/multipleChoiceSurvey.css'

interface SurveyValues {
    options: string[];
    name: string
    description: string
}

function MultipleChoiceSurvey({ options, name, description }: SurveyValues ) {
    const [selectedOption, setSelectedOption] = useState(null);


    const handleOptionChange = (event : any) => {
        setSelectedOption(event.target.value);
    };

    return (
        <div className="multipleChoiceSurvey">
            <h2 className = "mcSurveyTitle">{ name}</h2>
            <p className = "mcSurveyDescr">{description}</p>
            <form className="mcSurveyOptions">
                {options.map((option, index) => (
                    < div className="mcSurveyOption" key={index}>
                        <input
                            type="radio"
                            id={option}
                            name="option"
                            value={option}
                            checked={selectedOption === option}
                            onChange={handleOptionChange}
                        />
                        <label htmlFor={option}>{option}</label>
                    </div>
                ))}
            </form>

        </div>
    )
}
export default MultipleChoiceSurvey;

