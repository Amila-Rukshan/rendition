import * as React from 'react';
import FaClose from 'react-icons/lib/fa/close';
import styled from 'styled-components';
import asRendition from '../asRendition';
import { RenditionSystemProps } from '../common-types';
import Button from './Button';
import { Flex } from './Grid';
import Txt from './Txt';

const Container = styled(Flex)`
	background-color: ${props => props.theme.colors.info.light};
	border: 1px solid ${props => props.theme.colors.info.main};
	border-radius: 2px;
	line-height: 1.5;
`;

const TagText = styled(Txt)`
	font-family: ${props => props.theme.titleFont};
`;

const DeleteButton = styled(Button)`
	color: ${props => props.theme.colors.tertiary.semilight};
`;

const TagBase = ({
	name,
	operator,
	value,
	multiple,
	onClose,
	onClick,
	className,
}: InternalTagProps) => {
	const tagArray = multiple || [{ name, operator, value }];

	const tagContent = (
		<Container py={1} px={2}>
			{tagArray.map((tagEntry, index) => {
				return (
					<React.Fragment key={index}>
						{index > 0 && (
							<Txt
								whitespace="pre"
								color="info.main"
								fontSize={0}
								italic
							>{`  ${tagEntry.prefix || ','}  `}</Txt>
						)}

						{tagEntry.name && (
							<TagText whitespace="pre" color="info.main" fontSize={0}>
								{`${tagEntry.name}${
									tagEntry.operator ? ` ${tagEntry.operator} ` : ': '
								}`}
							</TagText>
						)}

						{tagEntry.value && (
							<TagText bold color="info.main" fontSize={0}>
								{tagEntry.value}
							</TagText>
						)}
					</React.Fragment>
				);
			})}
		</Container>
	);

	return (
		<Flex className={className}>
			{onClick ? (
				<Button plain onClick={onClick}>
					{tagContent}
				</Button>
			) : (
				tagContent
			)}
			{onClose && (
				<DeleteButton plain p={1} pl={2} pr={3} fontSize={0} onClick={onClose}>
					<FaClose />
				</DeleteButton>
			)}
		</Flex>
	);
};

export interface InternalTagProps {
	value?: string;
	name?: string;
	operator?: string;
	multiple?: Array<{
		value?: string;
		name?: string;
		operator?: string;
		prefix?: string;
	}>;
	onClose?: () => void;
	onClick?: () => void;
	className?: string;
}

export type TagProps = InternalTagProps & RenditionSystemProps;

export const Tag = asRendition<React.FunctionComponent<TagProps>>(
	TagBase as any,
);
