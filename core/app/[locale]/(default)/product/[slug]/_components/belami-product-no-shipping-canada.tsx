interface NoShipCanadaProps {
    description: string;
}

export const NoShipCanada = ({ description }: NoShipCanadaProps) => {

    return (
        <>
            
            <div className="product-free-delivery xs:flex xs:justify-center xs:items-center mt-1">
                <div className="bg-[#E7F5F8] w-fit p-1   xl:text-left text-[10px] xl:text-sm font-normal leading-6 tracking-wider ">
                    {description} {/* This product shipping is not available in canada  */}
                </div>
            </div>
        </>

    );
};