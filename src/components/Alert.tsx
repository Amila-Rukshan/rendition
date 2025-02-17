import * as React from 'react';
import FaCheckCircle from 'react-icons/lib/fa/check-circle';
import FaClose from 'react-icons/lib/fa/close';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle';
import FaExclamationTriangle from 'react-icons/lib/fa/exclamation-triangle';
import FaInfoCircle from 'react-icons/lib/fa/info-circle';
import styled from 'styled-components';
import asRendition from '../asRendition';
import {
	Coloring,
	DefaultProps,
	RenditionSystemProps,
	Sizing,
} from '../common-types';
import { bold, getColor, normal, px } from '../utils';
import { Flex } from './Grid';

const getPadding = (props: AlertProps) =>
	props.emphasized ? '15px 40px' : '8px 32px';

const getTitle = (props: AlertProps) => {
	if (props.prefix === false) {
		return;
	}
	if (props.prefix !== undefined) {
		return props.prefix;
	}
	return props.danger
		? 'Oh no!'
		: props.warning
		? 'Warning!'
		: props.success
		? 'Great!'
		: props.info
		? 'Hey!'
		: '';
};

const AlertTitle = styled.span`
	display: inline-flex;
	margin-right: 8px;
`;

// Firefox didn't middle align absolute positioned elements
// using flex, so we had to use an extra wrapper element
const DismissButtonWrapper = styled.div<InternalAlertProps>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 0;
	bottom: 0;
	right: ${props => px(props.emphasized ? 20 : 12)};
`;

const DismissButton = styled.button`
	padding: 0;
	border: 0;
	background: none;
	line-height: 0;
	font-size: 14px;
	cursor: pointer;

	&:hover {
		color: black;
	}
`;

const AlertBase = styled.div<InternalAlertProps>`
	display: flex;
	align-items: center;
	justify-content: normal;

	position: relative;
	min-height: ${props =>
		px(props.emphasized ? props.theme.space[5] : props.theme.space[4])};
	padding: ${props => getPadding(props)};
	margin: 0;
	border-radius: ${props => px(props.theme.radius)};
	font-family: inherit;
	font-size: 16px;
	font-kerning: none;
	font-weight: ${props => normal(props)};
	appearance: none;
	text-decoration: none;
	vertical-align: middle;
	line-height: 1.1;
`;

// That's the normal alert
const Outline = styled(AlertBase)<InternalAlertProps>`
	padding-left: 19px;
	border: 1px solid ${props => getColor(props, 'bg', 'main')};
	background: ${props => props.bg || getColor(props, 'bg', 'light')};
	color: ${props => props.theme.colors.text.main};

	& ${AlertTitle}, & ${DismissButtonWrapper} > ${DismissButton} {
		font-weight: ${props => bold(props)};
		color: ${props => getColor(props, 'color', 'main')};
	}
`;

const Filled = styled(AlertBase)<InternalAlertProps>`
	border: 0;
	font-weight: ${props => bold(props)};
	text-align: center;
	background: ${props => props.bg || getColor(props, 'bg', 'main')};
	color: ${props => props.color || '#fff'};
`;

const Plaintext = styled(AlertBase)<InternalAlertProps>`
	min-height: auto;
	padding: 0;
	font-size: ${props => px(props.theme.fontSizes[1])};

	&,
	& ${DismissButtonWrapper} > ${DismissButton} {
		color: ${props =>
			props.color ||
			(props.info
				? props.theme.colors.gray.main
				: getColor(props, 'color', 'main'))};
	}
`;

const getIcon = (props: InternalAlertProps) => {
	if (props.prefix === false) {
		return;
	}
	if (props.prefix !== undefined) {
		return props.prefix;
	}
	return props.danger ? (
		<FaExclamationCircle />
	) : props.warning ? (
		<FaExclamationTriangle />
	) : props.success ? (
		<FaCheckCircle />
	) : props.info ? (
		<FaInfoCircle />
	) : (
		''
	);
};

const DismissAlert = ({ onDismiss }: { onDismiss: () => void }) => (
	<DismissButtonWrapper>
		<DismissButton onClick={() => onDismiss && onDismiss()}>
			<FaClose />
		</DismissButton>
	</DismissButtonWrapper>
);

const Alert = (props: InternalAlertProps) => {
	const { emphasized, plaintext, prefix, onDismiss, ...restProps } = props;
	const title = plaintext ? getIcon(props) : getTitle(props);
	if (plaintext) {
		return (
			<Plaintext {...restProps}>
				<Flex>
					{title && <AlertTitle children={title} />}
					<div>{props.children}</div>
				</Flex>
				{onDismiss && <DismissAlert onDismiss={onDismiss} />}
			</Plaintext>
		);
	} else if (emphasized) {
		return (
			<Filled emphasized {...restProps}>
				<div>
					{title && <AlertTitle children={title} />}
					{props.children}
				</div>
				{onDismiss && <DismissAlert onDismiss={onDismiss} />}
			</Filled>
		);
	} else {
		return (
			<Outline {...restProps}>
				<div>
					{title && <AlertTitle children={title} />}
					{props.children}
				</div>
				{onDismiss && <DismissAlert onDismiss={onDismiss} />}
			</Outline>
		);
	}
};

interface InternalAlertProps extends DefaultProps, Coloring, Sizing {
	plaintext?: boolean;
	bg?: string;
	prefix?: JSX.Element | string | false;
	onDismiss?: () => void;
}

export type AlertProps = InternalAlertProps & RenditionSystemProps;
export default asRendition<React.FunctionComponent<AlertProps>>(
	Alert,
	[],
	['bg'],
);
